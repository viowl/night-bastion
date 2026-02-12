using UnityEngine;

namespace TowerDefense.Input
{
    public class BuildController : MonoBehaviour
    {
        public static BuildController Instance { get; private set; }
        
        [Header("References")]
        public Camera mainCamera;
        public LayerMask gridLayer;
        
        [Header("Building")]
        public GameObject[] towerPrefabs;
        public Core.TowerData[] towerDatas;
        
        [Header("Preview")]
        public GameObject buildPreviewPrefab;
        public Color validPlacementColor = new Color(0, 1, 0, 0.5f);
        public Color invalidPlacementColor = new Color(1, 0, 0, 0.5f);
        
        private int selectedTowerIndex = -1;
        private GameObject previewInstance;
        private SpriteRenderer previewRenderer;
        private bool isPlacing = false;
        
        public bool IsPlacing => isPlacing;
        public Core.TowerData SelectedTowerData => selectedTowerIndex >= 0 && selectedTowerIndex < towerDatas.Length ? towerDatas[selectedTowerIndex] : null;
        
        private void Awake()
        {
            Instance = this;
        }
        
        private void Update()
        {
            if (isPlacing)
            {
                UpdatePreview();
                
                if (UnityEngine.Input.GetMouseButtonDown(0))
                {
                    TryPlaceTower();
                }
                
                if (UnityEngine.Input.GetMouseButtonDown(1) || UnityEngine.Input.GetKeyDown(KeyCode.Escape))
                {
                    CancelBuilding();
                }
            }
        }
        
        public void SelectTower(int index)
        {
            if (index < 0 || index >= towerPrefabs.Length) return;
            if (index >= towerDatas.Length) return;
            
            selectedTowerIndex = index;
            isPlacing = true;
            
            // Create preview
            if (previewInstance == null)
            {
                previewInstance = Instantiate(buildPreviewPrefab);
                previewRenderer = previewInstance.GetComponent<SpriteRenderer>();
            }
            
            previewInstance.SetActive(true);
            previewRenderer.sprite = towerDatas[index].levelSprites[0];
        }
        
        private void UpdatePreview()
        {
            if (previewInstance == null) return;
            
            Vector3 mouseWorldPos = mainCamera.ScreenToWorldPoint(UnityEngine.Input.mousePosition);
            mouseWorldPos.z = 0;
            
            Vector2Int gridPos = Core.GridManager.Instance.WorldToGrid(mouseWorldPos);
            Vector3 snapPos = Core.GridManager.Instance.GridToWorld(gridPos);
            
            previewInstance.transform.position = snapPos;
            
            // Check if placement is valid
            bool isValid = CanBuildAt(gridPos);
            previewRenderer.color = isValid ? validPlacementColor : invalidPlacementColor;
            
            // Update path preview
            // This would show the path enemies would take
        }
        
        private void TryPlaceTower()
        {
            Vector3 mouseWorldPos = mainCamera.ScreenToWorldPoint(UnityEngine.Input.mousePosition);
            mouseWorldPos.z = 0;
            
            Vector2Int gridPos = Core.GridManager.Instance.WorldToGrid(mouseWorldPos);
            
            if (!CanBuildAt(gridPos)) return;
            
            var towerData = towerDatas[selectedTowerIndex];
            
            // Check gold
            if (!Core.GameManager.Instance.SpendGold(towerData.baseCost))
            {
                Debug.Log("Not enough gold!");
                return;
            }
            
            // Place tower
            Vector3 buildPos = Core.GridManager.Instance.GridToWorld(gridPos);
            GameObject towerObj = Instantiate(towerPrefabs[selectedTowerIndex], buildPos, Quaternion.identity);
            
            var tower = towerObj.GetComponent<Core.BaseTower>();
            if (tower != null)
            {
                tower.Initialize(gridPos);
                Core.GridManager.Instance.PlaceTower(gridPos, tower);
            }
            
            // Play build effect
            if (towerData.buildEffectPrefab != null)
            {
                Instantiate(towerData.buildEffectPrefab, buildPos, Quaternion.identity);
            }
            
            // Play sound
            if (towerData.buildSound != null)
            {
                AudioSource.PlayClipAtPoint(towerData.buildSound, buildPos);
            }
            
            // Keep building mode active for multiple placements
            // CancelBuilding(); // Uncomment to build only one at a time
        }
        
        private bool CanBuildAt(Vector2Int gridPos)
        {
            if (!Core.GridManager.Instance.IsValidPosition(gridPos))
                return false;
            
            if (!Core.GridManager.Instance.IsBuildable(gridPos))
                return false;
            
            // Check if path is still valid after placement
            // Temporarily mark as blocked and check path
            // This is expensive, so we might want to cache results
            
            return true;
        }
        
        public void CancelBuilding()
        {
            isPlacing = false;
            selectedTowerIndex = -1;
            
            if (previewInstance != null)
            {
                previewInstance.SetActive(false);
            }
            
            GameEvents.OnBuildCancelled?.Invoke();
        }
        
        public void SellTower(Core.BaseTower tower)
        {
            if (tower == null) return;
            
            // Return 70% of invested gold
            int refund = Mathf.FloorToInt(tower.TotalInvestedGold * 0.7f);
            Core.GameManager.Instance.AddGold(refund);
            
            // Remove from grid
            Core.GridManager.Instance.RemoveTower(tower.GridPosition);
            
            // Destroy tower
            Destroy(tower.gameObject);
            
            GameEvents.OnTowerSold?.Invoke(tower);
        }
    }
}