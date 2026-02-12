using UnityEngine;

namespace TowerDefense.UI
{
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance { get; private set; }
        
        [Header("UI Panels")]
        public GameHUD gameHUD;
        public UpgradePanel upgradePanel;
        public TooltipSystem tooltipSystem;
        
        private void Awake()
        {
            Instance = this;
        }
        
        public void ShowTooltip(string text, Vector3 position)
        {
            tooltipSystem?.ShowTooltip(text, position);
        }
        
        public void HideTooltip()
        {
            tooltipSystem?.HideTooltip();
        }
    }
}