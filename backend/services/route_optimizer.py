import math
from typing import List, Dict, Any

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes genuine geodesic distance in kilometers between two GPS coordinates.
    """
    R = 6371.0  # Earth's radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_route_distance(nodes: List[Dict[str, Any]]) -> float:
    dist = 0.0
    for i in range(len(nodes) - 1):
        dist += haversine_distance_km(
            nodes[i]["latitude"], nodes[i]["longitude"],
            nodes[i + 1]["latitude"], nodes[i + 1]["longitude"]
        )
    return dist

def solve_tsp_2opt(bins: List[Dict[str, Any]], start_lat: float, start_lng: float) -> Dict[str, Any]:
    """
    Optimizes waste collection path visiting all selected bins using
    Nearest-Neighbor initialization + 2-Opt tour optimization.
    """
    if not bins:
        return {
            "ordered_bins": [],
            "total_distance_km": 0.0,
            "standard_distance_km": 0.0,
            "distance_saved_km": 0.0,
            "estimated_time_minutes": 0,
            "time_saved_minutes": 0,
            "algorithm": "2-Opt Nearest Neighbor TSP"
        }

    # Standard unoptimized sequence distance (sequential order)
    standard_nodes = [{"latitude": start_lat, "longitude": start_lng}] + bins
    standard_distance = calculate_route_distance(standard_nodes)

    # 1. Nearest Neighbor construction
    unvisited = bins.copy()
    current_pos = (start_lat, start_lng)
    optimized_path = []

    while unvisited:
        best_idx = 0
        best_dist = float("inf")
        for idx, item in enumerate(unvisited):
            d = haversine_distance_km(current_pos[0], current_pos[1], item["latitude"], item["longitude"])
            # Give slight priority to overflowing/critical bins
            if item.get("fill_level", 0) > 85:
                d *= 0.85
            if d < best_dist:
                best_dist = d
                best_idx = idx

        next_bin = unvisited.pop(best_idx)
        optimized_path.append(next_bin)
        current_pos = (next_bin["latitude"], next_bin["longitude"])

    # 2. 2-Opt local search improvement
    improved = True
    iterations = 0
    while improved and iterations < 50:
        improved = False
        iterations += 1
        for i in range(len(optimized_path) - 1):
            for j in range(i + 2, len(optimized_path)):
                # calculate current dist
                current_tour = [{"latitude": start_lat, "longitude": start_lng}] + optimized_path
                curr_dist = calculate_route_distance(current_tour)

                # try swap
                candidate = optimized_path.copy()
                candidate[i:j] = reversed(candidate[i:j])
                new_tour = [{"latitude": start_lat, "longitude": start_lng}] + candidate
                new_dist = calculate_route_distance(new_tour)

                if new_dist < curr_dist - 0.01:
                    optimized_path = candidate
                    improved = True
                    break
            if improved:
                break

    optimized_tour = [{"latitude": start_lat, "longitude": start_lng}] + optimized_path
    optimized_distance = calculate_route_distance(optimized_tour)

    # If optimized distance happened to be larger (edge case), keep standard
    if optimized_distance > standard_distance:
        optimized_distance = standard_distance
        optimized_path = bins

    # Speed estimation: average 25 km/h urban collection speed + 3 mins per bin pickup
    avg_speed_kmh = 25.0
    transit_mins = (optimized_distance / avg_speed_kmh) * 60.0
    pickup_mins = len(optimized_path) * 3.5
    est_total_mins = int(round(transit_mins + pickup_mins))

    std_transit_mins = (standard_distance / avg_speed_kmh) * 60.0
    std_total_mins = int(round(std_transit_mins + pickup_mins))

    dist_saved = max(0.0, standard_distance - optimized_distance)
    time_saved = max(0, std_total_mins - est_total_mins)

    return {
        "ordered_bins": optimized_path,
        "total_distance_km": round(optimized_distance, 2),
        "standard_distance_km": round(standard_distance, 2),
        "distance_saved_km": round(dist_saved, 2),
        "estimated_time_minutes": est_total_mins,
        "time_saved_minutes": time_saved,
        "algorithm": "2-Opt Nearest Neighbor TSP with Fill-Priority Weighting"
    }

