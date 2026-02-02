// #include <bits/stdc++.h>
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <cmath>
#include <fstream>
#include <sstream>
#include <limits>

using namespace std;

/* =========================
   DATA STRUCTURES
   ========================= */

struct Employee
{
    string id;
    int priority;
    int sharing_limit; // 1,2,3
    string vehicle_pref;
    double p_lat, p_lon;
    double d_lat, d_lon;
    int tw_start, tw_end;
    bool assigned = false;
};

struct Vehicle
{
    string id;
    int capacity;
    double cost_per_km;
    double lat, lon;
    vector<Employee *> passengers;
};

struct Relaxation
{
    string message;
};

/* =========================
   HAVERSINE DISTANCE
   ========================= */

double haversine(double lat1, double lon1,
                 double lat2, double lon2)
{
    const double R = 6371.0;
    double dLat = (lat2 - lat1) * M_PI / 180.0;
    double dLon = (lon2 - lon1) * M_PI / 180.0;
    lat1 = lat1 * M_PI / 180.0;
    lat2 = lat2 * M_PI / 180.0;

    double a = pow(sin(dLat / 2), 2) +
               pow(sin(dLon / 2), 2) * cos(lat1) * cos(lat2);
    double c = 2 * asin(sqrt(a));
    return R * c;
}

/* =========================
   CSV READER
   ========================= */

vector<string> split(const string &s, char delim)
{
    vector<string> elems;
    string item;
    stringstream ss(s);
    while (getline(ss, item, delim))
        elems.push_back(item);
    return elems;
}

/* =========================
   FEASIBILITY CHECK
   ========================= */

bool can_assign(Employee &e, Vehicle &v, bool relax = false)
{
    if ((int)v.passengers.size() >= v.capacity)
        return false;

    int new_count = v.passengers.size() + 1;

    if (!relax)
    {
        if (new_count > e.sharing_limit)
            return false;
        for (auto *p : v.passengers)
            if (new_count > p->sharing_limit)
                return false;
    }
    return true;
}

/* =========================
   COST FUNCTION
   ========================= */

double incremental_cost(Employee &e, Vehicle &v)
{
    double d1 = haversine(v.lat, v.lon, e.p_lat, e.p_lon);
    double d2 = haversine(e.p_lat, e.p_lon, e.d_lat, e.d_lon);
    return (d1 + d2) * v.cost_per_km;
}

int timeToMinutes(const string &t)
{
    int h = stoi(t.substr(0, 2));
    int m = stoi(t.substr(3, 2));
    return h * 60 + m;
}

/* =========================
   MAIN SOLVER
   ========================= */

int main()
{

    /* ===== LOAD EMPLOYEES ===== */
    vector<Employee> employees;
    ifstream efile("data1/employees.csv");

    if (!efile.is_open())
    {
        cout << "ERROR: employees.csv not opened\n";
        return 0;
    }

    string line;
    getline(efile, line); // header

    while (getline(efile, line))
    {
        if (line.empty())
            continue;

        auto row = split(line, ',');
        if (row.size() < 10)
            continue;

        Employee e;
        try
        {
            e.id = row[0];
            e.priority = stoi(row[1]);

            e.p_lat = stod(row[2]);
            e.p_lon = stod(row[3]);
            e.d_lat = stod(row[4]);
            e.d_lon = stod(row[5]);

            e.tw_start = timeToMinutes(row[6]);
            e.tw_end = timeToMinutes(row[7]);

            e.vehicle_pref = row[8];

            if (row[9] == "single")
                e.sharing_limit = 1;
            else if (row[9] == "double")
                e.sharing_limit = 2;
            else
                e.sharing_limit = 3;

            employees.push_back(e);
        }
        catch (...)
        {
            cout << "Bad employee row skipped: " << line << endl;
        }
    }
    cout << "Employees loaded: " << employees.size() << endl;

    /* ===== LOAD VEHICLES ===== */
    /* ===== LOAD VEHICLES ===== */
    vector<Vehicle> vehicles;
    ifstream vfile("data1/vehicles.csv");

    if (!vfile.is_open())
    {
        cout << "ERROR: vehicles.csv not opened\n";
        return 0;
    }

    getline(vfile, line); // header

    while (getline(vfile, line))
    {
        if (line.empty())
            continue;

        auto row = split(line, ',');
        if (row.size() < 10)
            continue;

        Vehicle v;
        try
        {
            v.id = row[0];

            // seating_capacity
            v.capacity = stoi(row[3]);

            // cost per km
            v.cost_per_km = stod(row[4]);

            // current vehicle location
            v.lat = stod(row[6]);
            v.lon = stod(row[7]);

            vehicles.push_back(v);
        }
        catch (...)
        {
            cout << "Bad vehicle row skipped: " << line << endl;
        }
    }

    cout << "Vehicles loaded: " << vehicles.size() << endl;

    /* ===== SORT EMPLOYEES ===== */
    sort(employees.begin(), employees.end(),
         [](const Employee &a, const Employee &b)
         {
             if (a.priority != b.priority)
                 return a.priority < b.priority;
             return a.sharing_limit < b.sharing_limit;
         });

    vector<Employee *> unassigned;
    vector<Relaxation> relaxations;

    /* ===== PHASE 1: STRICT GREEDY ===== */
    for (auto &e : employees)
    {
        double best_cost = 1e18;
        Vehicle *best_v = nullptr;

        for (auto &v : vehicles)
        {
            if (!can_assign(e, v))
                continue;
            double c = incremental_cost(e, v);
            if (c < best_cost)
            {
                best_cost = c;
                best_v = &v;
            }
        }

        if (best_v)
        {
            best_v->passengers.push_back(&e);
            e.assigned = true;
        }
        else
        {
            unassigned.push_back(&e);
        }
    }

    /* ===== PHASE 2: CONTROLLED RELAXATION ===== */
    for (auto *e : unassigned)
    {
        bool done = false;

        for (auto &v : vehicles)
        {
            for (auto *p : v.passengers)
            {
                int old = p->sharing_limit;
                p->sharing_limit = 3;

                if (can_assign(*e, v, true))
                {
                    v.passengers.push_back(e);
                    e->assigned = true;
                    relaxations.push_back({"Relaxed sharing of " + p->id +
                                           " to assign " + e->id +
                                           " to " + v.id});
                    done = true;
                    break;
                }
                p->sharing_limit = old;
            }
            if (done)
                break;
        }

        if (!done)
        {
            cout << "Still infeasible: " << e->id << "\n";
        }
    }

    /* ===== OUTPUT ===== */
    cout << "\nFINAL ASSIGNMENTS\n";
    for (auto &v : vehicles)
    {
        cout << v.id << " → ";
        for (auto *p : v.passengers)
            cout << p->id << " ";
        cout << "\n";
    }

    cout << "\nRELAXATIONS APPLIED\n";
    for (auto &r : relaxations)
        cout << "- " << r.message << "\n";

    return 0;
}