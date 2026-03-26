export type GridGraph = { [node: string]: { [neighbor: string]: number } };

/**
 * Calculates shortest path between source and target using 
 * Bellman-Ford Moore Shortest Path (BMSSP) algorithm.
 * Evaluates negative weights if exist, mostly used for O(V * E) shortest path in weighted graphs.
 */
export function bmsspCalculateDistance(graph: GridGraph, source: string, target: string) {
    const vertices = Object.keys(graph);
    
    // Distances map
    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};
    
    for (const v of vertices) {
        dist[v] = Infinity;
        prev[v] = null;
    }
    dist[source] = 0;
    
    // Relaxation loop
    for (let i = 0; i < vertices.length - 1; i++) {
        for (const u of vertices) {
            for (const v in graph[u]) {
                const weight = graph[u][v];
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    prev[v] = u;
                }
            }
        }
    }
    
    // Detect negative cycles for completion
    for (const u of vertices) {
        for (const v in graph[u]) {
            const weight = graph[u][v];
            if (dist[u] + weight < dist[v]) {
                console.warn("Graph contains a negative weight cycle!");
            }
        }
    }
    
    // Reconstruct path
    const path: string[] = [];
    let curr: string | null = target;
    while (curr) {
        path.unshift(curr);
        curr = prev[curr];
    }
    
    return {
        distance: dist[target],
        path: path[0] === source ? path : []
    };
}

// Map real-world typical coordinates to locations for Visual Map
export const CITY_NODES: Record<string, [number, number]> = {
    "cp": [28.6304, 77.2177],
    "airport": [28.5562, 77.1000],
    "noida": [28.5355, 77.3910],
    "gurgaon": [28.4595, 77.0266],
    "dwarka": [28.5823, 77.0500],
    "saket": [28.5246, 77.2066]
};

export const MOCK_GRAPH: GridGraph = {
    "cp": { "airport": 15, "noida": 22, "saket": 12 },
    "airport": { "cp": 15, "gurgaon": 18, "dwarka": 8 },
    "noida": { "cp": 22, "saket": 16 },
    "gurgaon": { "airport": 18, "saket": 20, "dwarka": 14 },
    "dwarka": { "airport": 8, "gurgaon": 14 },
    "saket": { "cp": 12, "noida": 16, "gurgaon": 20 }
};
