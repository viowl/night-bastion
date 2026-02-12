using UnityEngine;
using TMPro;
using UnityEngine.UI;

namespace TowerDefense.UI
{
    public class UpgradePanel : MonoBehaviour
    {
        [Header("Panel References")]
        public GameObject panel;
        public TextMeshProUGUI towerNameText;
        public TextMeshProUGUI currentLevelText;
        public TextMeshProUGUI damageText;
        public TextMeshProUGUI attackSpeedText;
        public TextMeshProUGUI rangeText;
        
        [Header("Upgrade Buttons")]
        public Button[] upgradeButtons;
        public TextMeshProUGUI[] upgradeCostTexts;
        public TextMeshProUGUI[] upgradeDescriptionTexts;
        
        [Header("Sell Button")]
        public Button sellButton;
        public TextMeshProUGUI sellValueText;
        
        [Header("Synergy Display")]
        public GameObject synergyPanel;
        public TextMeshProUGUI synergyText;
        
        private Core.BaseTower selectedTower;
        
        private void Start()
        {
            HidePanel();
            
            // Setup sell button
            if (sellButton != null)
                sellButton.onClick.AddListener(SellSelectedTower);
            
            // Setup upgrade buttons
            for (int i = 0; i < upgradeButtons.Length; i++)
            {
                int index = i;
                upgradeButtons[i].onClick.AddListener(() => UpgradeTower(index));
            }
        }
        
        private void Update()
        {
            // Check for tower selection via click
            if (UnityEngine.Input.GetMouseButtonDown(0))
            {
                CheckForTowerSelection();
            }
            
            // Hide panel on escape or right click
            if (UnityEngine.Input.GetKeyDown(KeyCode.Escape) || UnityEngine.Input.GetMouseButtonDown(1))
            {
                HidePanel();
            }
        }
        
        private void CheckForTowerSelection()
        {
            if (Input.BuildController.Instance != null && Input.BuildController.Instance.IsPlacing)
                return;
            
            Vector3 mousePos = Camera.main.ScreenToWorldPoint(UnityEngine.Input.mousePosition);
            mousePos.z = 0;
            
            RaycastHit2D hit = Physics2D.Raycast(mousePos, Vector2.zero);
            if (hit.collider != null)
            {
                var tower = hit.collider.GetComponent<Core.BaseTower>();
                if (tower != null)
                {
                    SelectTower(tower);
                    return;
                }
            }
            
            // Clicked on empty space - don't hide immediately to allow for UI interaction
            // HidePanel();
        }
        
        public void SelectTower(Core.BaseTower tower)
        {
            selectedTower = tower;
            ShowPanel();
            UpdatePanelInfo();
        }
        
        private void ShowPanel()
        {
            if (panel != null)
                panel.SetActive(true);
        }
        
        private void HidePanel()
        {
            if (panel != null)
                panel.SetActive(false);
            selectedTower = null;
        }
        
        private void UpdatePanelInfo()
        {
            if (selectedTower == null || selectedTower.towerData == null) return;
            
            // Basic info
            if (towerNameText != null)
                towerNameText.text = selectedTower.towerData.towerName;
            
            if (currentLevelText != null)
                currentLevelText.text = $"Level {selectedTower.CurrentLevel}";
            
            if (damageText != null)
                damageText.text = $"Damage: {selectedTower.CurrentDamage:F1}";
            
            if (attackSpeedText != null)
                attackSpeedText.text = $"Speed: {selectedTower.CurrentAttackSpeed:F2}/s";
            
            if (rangeText != null)
                rangeText.text = $"Range: {selectedTower.CurrentRange:F1}";
            
            // Update upgrade buttons
            UpdateUpgradeButtons();
            
            // Update sell value
            if (sellValueText != null)
            {
                int sellValue = Mathf.FloorToInt(selectedTower.TotalInvestedGold * 0.7f);
                sellValueText.text = $"Sell: {sellValue}g";
            }
            
            // Update synergy info
            UpdateSynergyInfo();
        }
        
        private void UpdateUpgradeButtons()
        {
            if (selectedTower?.towerData?.upgradeBranches == null) return;
            
            for (int i = 0; i < upgradeButtons.Length && i < selectedTower.towerData.upgradeBranches.Length; i++)
            {
                var branch = selectedTower.towerData.upgradeBranches[i];
                bool canUpgrade = selectedTower.CurrentLevel < 4 && selectedTower.CurrentLevel - 1 < branch.levels.Length;
                
                if (canUpgrade)
                {
                    var upgrade = branch.levels[selectedTower.CurrentLevel - 1];
                    canUpgrade = Core.GameManager.Instance.CurrentGold >= upgrade.cost;
                    
                    if (upgradeCostTexts != null && i < upgradeCostTexts.Length)
                        upgradeCostTexts[i].text = $"{upgrade.cost}g";
                    
                    if (upgradeDescriptionTexts != null && i < upgradeDescriptionTexts.Length)
                        upgradeDescriptionTexts[i].text = upgrade.description;
                }
                else
                {
                    if (upgradeCostTexts != null && i < upgradeCostTexts.Length)
                        upgradeCostTexts[i].text = "MAX";
                    
                    if (upgradeDescriptionTexts != null && i < upgradeDescriptionTexts.Length)
                        upgradeDescriptionTexts[i].text = "Max Level Reached";
                }
                
                upgradeButtons[i].interactable = canUpgrade;
            }
        }
        
        private void UpdateSynergyInfo()
        {
            if (synergyPanel == null || synergyText == null) return;
            
            var synergies = Towers.SynergyManager.Instance?.GetActiveSynergies(selectedTower);
            if (synergies != null && synergies.Count > 0)
            {
                synergyPanel.SetActive(true);
                string synergyInfo = "Active Synergies:\n";
                foreach (var synergy in synergies)
                {
                    synergyInfo += $"• {synergy.synergyName}\n";
                }
                synergyText.text = synergyInfo;
            }
            else
            {
                synergyPanel.SetActive(false);
            }
        }
        
        private void UpgradeTower(int branchIndex)
        {
            if (selectedTower == null) return;
            
            Core.UpgradePath path = (Core.UpgradePath)(branchIndex + 1);
            bool success = selectedTower.Upgrade(path);
            
            if (success)
            {
                UpdatePanelInfo();
            }
        }
        
        private void SellSelectedTower()
        {
            if (selectedTower == null) return;
            
            Input.BuildController.Instance.SellTower(selectedTower);
            HidePanel();
        }
    }
}