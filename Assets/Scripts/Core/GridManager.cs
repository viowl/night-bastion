using System.Collections.Generic;
using UnityEngine;

namespace TowerDefense.Core
{
    public class GridManager : MonoBehaviour
    {
        public static GridManager Instance { get; private set; }
        
        [Header("Grid Settings")]
        public int gridWidth = 20;
        public int gridHeight = 12;
        public float cellSize = 2f;
        public Vector3 gridOrigin = Vector3.zero;
        
        [Header("Debug")]
        public bool showGrid = true;
        public bool showPath = true;
        public Color gridColor = Color.gray;
        public Color pathColor = Color.yellow;
        public Color buildableColor = new Color(0, 1, 0, 0.3f);
        public Color blockedColor = new Color(1, 0, 0, 0.3f);
        
        private GridCell[,] grid;
        private List<Vector2Int> currentPath;
        
        public GridCell[,] Grid => grid;
        
        private void Awake()
        {
            Instance = this;
            InitializeGrid();
        }
        
        private void InitializeGrid()
        {
            grid = new GridCell[gridWidth, gridHeight];
            
            for (int x = 0; x < gridWidth; x++)
            {
                for (int y = 0; y < gridHeight; y++)
                {
                    grid[x, y] = new GridCell
                    {
                        position = new Vector2Int(x, y),
                        worldPosition = GridToWorld(new Vector2Int(x, y)),
                        isWalkable = true,
                        hasTower = false
                    };
                }
            }
            
            // Set default path (straight line from left to right)
            int centerY = gridHeight / 2;
            for (int x = 0; x < gridWidth; x++)
            {
                grid[x, centerY].isWalkable = true;
                grid[x, centerY].isPath = true;
            }
        }
        
        public Vector3 GridToWorld(Vector2Int gridPos)
        {
            return gridOrigin + new Vector3(gridPos.x * cellSize, gridPos.y * cellSize, 0);
        }
        
        public Vector2Int WorldToGrid(Vector3 worldPos)
        {
            Vector3 localPos = worldPos - gridOrigin;
            return new Vector2Int(
                Mathf.RoundToInt(localPos.x / cellSize),
                Mathf.RoundToInt(localPos.y / cellSize)
            );
        }
        
        public bool IsValidPosition(Vector2Int gridPos)
        {
            return gridPos.x >= 0 && gridPos.x < gridWidth &&
                   gridPos.y >= 0 && gridPos.y < gridHeight;
        }
        
        public bool IsWalkable(Vector2Int gridPos)
        {
            if (!IsValidPosition(gridPos)) return false;
            return grid[gridPos.x, gridPos.y].isWalkable && !grid[gridPos.x, gridPos.y].hasTower;
        }
        
        public bool IsBuildable(Vector2Int gridPos)
        {
            if (!IsValidPosition(gridPos)) return false;
            return !grid[gridPos.x, gridPos.y].hasTower && grid[gridPos.x, gridPos.y].isWalkable;
        }
        
        public bool PlaceTower(Vector2Int gridPos, BaseTower tower)
        {
            if (!IsBuildable(gridPos)) return false;
            
            grid[gridPos.x, gridPos.y].hasTower = true;
            grid[gridPos.x, gridPos.y].tower = tower;
            
            // Notify pathfinding that grid changed
            GameEvents.OnTowerBuilt?.Invoke(tower);
            
            return true;
        }
        
        public bool RemoveTower(Vector2Int gridPos)
        {
            if (!IsValidPosition(gridPos)) return false;
            if (!grid[gridPos.x, gridPos.y].hasTower) return false;
            
            grid[gridPos.x, gridPos.y].hasTower = false;
            grid[gridPos.x, gridPos.y].tower = null;
            
            return true;
        }
        
        public BaseTower GetTowerAt(Vector2Int gridPos)
        {
            if (!IsValidPosition(gridPos)) return null;
            return grid[gridPos.x, gridPos.y].tower;
        }
        
        public void SetPath(List<Vector2Int> path)
        {
            currentPath = path;
        }
        
        public List<Vector2Int> GetPath()
        {
            return currentPath;
        }
        
        private void OnDrawGizmos()
        {
            if (!showGrid) return;
            
            // Draw grid
            Gizmos.color = gridColor;
            for (int x = 0; x <= gridWidth; x++)
            {
                Vector3 start = gridOrigin + new Vector3(x * cellSize, 0, 0);
                Vector3 end = gridOrigin + new Vector3(x * cellSize, gridHeight * cellSize, 0);
                Gizmos.DrawLine(start, end);
            }
            
            for (int y = 0; y <= gridHeight; y++)
            {
                Vector3 start = gridOrigin + new Vector3(0, y * cellSize, 0);
                Vector3 end = gridOrigin + new Vector3(gridWidth * cellSize, y * cellSize, 0);
                Gizmos.DrawLine(start, end);
            }
            
            // Draw cells
            if (grid != null)
            {
                for (int x = 0; x < gridWidth; x++)
                {
                    for (int y = 0; y < gridHeight; y++)
                    {
                        Vector3 center = GridToWorld(new Vector2Int(x, y));
                        
                        if (grid[x, y].hasTower)
                        {
                            Gizmos.color = blockedColor;
                            Gizmos.DrawCube(center, Vector3.one * cellSize * 0.9f);
                        }
                    }
                }
            }
            
            // Draw path
            if (showPath && currentPath != null && currentPath.Count > 1)
            {
                Gizmos.color = pathColor;
                for (int i = 0; i < currentPath.Count - 1; i++)
                {
                    Vector3 start = GridToWorld(currentPath[i]);
                    Vector3 end = GridToWorld(currentPath[i + 1]);
                    Gizmos.DrawLine(start, end);
                    Gizmos.DrawSphere(start, 0.2f);
                }
            }
        }
    }
    
    public class GridCell
    {
        public Vector2Int position;
        public Vector3 worldPosition;
        public bool isWalkable = true;
        public bool isPath = false;
        public bool hasTower = false;
        public BaseTower tower;
    }
}