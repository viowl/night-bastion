using System.Collections.Generic;
using UnityEngine;

namespace TowerDefense.Core
{
    public class PathfindingManager : MonoBehaviour
    {
        public static PathfindingManager Instance { get; private set; }
        
        [Header("Pathfinding")]
        public Transform spawnPoint;
        public Transform exitPoint;
        
        private GridManager grid;
        private Dictionary<string, List<Vector2Int>> pathCache = new Dictionary<string, List<Vector2Int>>();
        
        private void Awake()
        {
            Instance = this;
            grid = GetComponent<GridManager>();
        }
        
        private void Start()
        {
            // Calculate initial path
            CalculateAndCachePath();
        }
        
        public List<Vector3> CalculatePath(Vector3 start, Vector3 end)
        {
            Vector2Int startGrid = grid.WorldToGrid(start);
            Vector2Int endGrid = grid.WorldToGrid(end);
            
            var path = FindPath(startGrid, endGrid);
            
            if (path == null)
                return null;
            
            // Convert to world positions
            List<Vector3> worldPath = new List<Vector3>();
            foreach (var point in path)
            {
                worldPath.Add(grid.GridToWorld(point));
            }
            
            return worldPath;
        }
        
        public bool IsPathValid()
        {
            if (spawnPoint == null || exitPoint == null) return false;
            
            Vector2Int start = grid.WorldToGrid(spawnPoint.position);
            Vector2Int end = grid.WorldToGrid(exitPoint.position);
            
            var path = FindPath(start, end);
            return path != null && path.Count > 0;
        }
        
        public List<Vector3> GetCurrentPath()
        {
            return CalculatePath(spawnPoint.position, exitPoint.position);
        }
        
        private void CalculateAndCachePath()
        {
            var path = GetCurrentPath();
            if (path != null)
            {
                List<Vector2Int> gridPath = new List<Vector2Int>();
                foreach (var worldPos in path)
                {
                    gridPath.Add(grid.WorldToGrid(worldPos));
                }
                grid.SetPath(gridPath);
            }
        }
        
        private List<Vector2Int> FindPath(Vector2Int start, Vector2Int end)
        {
            var openSet = new List<Node>();
            var closedSet = new HashSet<Vector2Int>();
            
            Node startNode = new Node(start);
            startNode.gCost = 0;
            startNode.hCost = GetDistance(start, end);
            startNode.CalculateFCost();
            
            openSet.Add(startNode);
            
            int iterations = 0;
            int maxIterations = grid.Grid.GetLength(0) * grid.Grid.GetLength(1) * 2;
            
            while (openSet.Count > 0 && iterations < maxIterations)
            {
                iterations++;
                
                // Get node with lowest fCost
                Node currentNode = openSet[0];
                for (int i = 1; i < openSet.Count; i++)
                {
                    if (openSet[i].fCost < currentNode.fCost ||
                        (openSet[i].fCost == currentNode.fCost && openSet[i].hCost < currentNode.hCost))
                    {
                        currentNode = openSet[i];
                    }
                }
                
                openSet.Remove(currentNode);
                closedSet.Add(currentNode.position);
                
                if (currentNode.position == end)
                {
                    return RetracePath(startNode, currentNode);
                }
                
                foreach (var neighbor in GetNeighbors(currentNode.position))
                {
                    if (closedSet.Contains(neighbor) || !grid.IsWalkable(neighbor))
                        continue;
                    
                    Node neighborNode = GetNode(neighbor, openSet);
                    float newMovementCostToNeighbor = currentNode.gCost + GetDistance(currentNode.position, neighbor);
                    
                    if (newMovementCostToNeighbor < neighborNode.gCost || !openSet.Contains(neighborNode))
                    {
                        neighborNode.gCost = newMovementCostToNeighbor;
                        neighborNode.hCost = GetDistance(neighbor, end);
                        neighborNode.CalculateFCost();
                        neighborNode.parent = currentNode;
                        
                        if (!openSet.Contains(neighborNode))
                            openSet.Add(neighborNode);
                    }
                }
            }
            
            return null;
        }
        
        private List<Vector2Int> RetracePath(Node startNode, Node endNode)
        {
            List<Vector2Int> path = new List<Vector2Int>();
            Node currentNode = endNode;
            
            while (currentNode != startNode && currentNode != null)
            {
                path.Add(currentNode.position);
                currentNode = currentNode.parent;
            }
            
            path.Reverse();
            return path;
        }
        
        private List<Vector2Int> GetNeighbors(Vector2Int pos)
        {
            List<Vector2Int> neighbors = new List<Vector2Int>();
            
            // 4-directional movement
            neighbors.Add(new Vector2Int(pos.x + 1, pos.y));
            neighbors.Add(new Vector2Int(pos.x - 1, pos.y));
            neighbors.Add(new Vector2Int(pos.x, pos.y + 1));
            neighbors.Add(new Vector2Int(pos.x, pos.y - 1));
            
            return neighbors;
        }
        
        private float GetDistance(Vector2Int a, Vector2Int b)
        {
            return Mathf.Abs(a.x - b.x) + Mathf.Abs(a.y - b.y);
        }
        
        private Node GetNode(Vector2Int pos, List<Node> openSet)
        {
            foreach (var node in openSet)
            {
                if (node.position == pos)
                    return node;
            }
            return new Node(pos);
        }
        
        private class Node
        {
            public Vector2Int position;
            public float gCost;
            public float hCost;
            public float fCost;
            public Node parent;
            
            public Node(Vector2Int pos)
            {
                position = pos;
                gCost = float.MaxValue;
            }
            
            public void CalculateFCost()
            {
                fCost = gCost + hCost;
            }
        }
        
        private void OnEnable()
        {
            GameEvents.OnTowerBuilt += OnTowerBuilt;
        }
        
        private void OnDisable()
        {
            GameEvents.OnTowerBuilt -= OnTowerBuilt;
        }
        
        private void OnTowerBuilt(BaseTower tower)
        {
            // Recalculate path when tower is built
            CalculateAndCachePath();
        }
    }
}