using UnityEngine;
using TMPro;

namespace TowerDefense.UI
{
    public class TooltipSystem : MonoBehaviour
    {
        [Header("References")]
        public GameObject tooltipPanel;
        public TextMeshProUGUI tooltipText;
        public RectTransform tooltipRect;
        
        [Header("Settings")]
        public Vector2 offset = new Vector2(10, 10);
        public float fadeTime = 0.2f;
        
        private Canvas canvas;
        private Camera mainCamera;
        
        private void Awake()
        {
            canvas = GetComponentInParent<Canvas>();
            mainCamera = Camera.main;
            HideTooltip();
        }
        
        public void ShowTooltip(string text, Vector3 worldPosition)
        {
            if (tooltipPanel == null || tooltipText == null) return;
            
            tooltipText.text = text;
            tooltipPanel.SetActive(true);
            
            // Position tooltip near mouse or object
            Vector2 screenPos = mainCamera.WorldToScreenPoint(worldPosition);
            PositionTooltip(screenPos);
        }
        
        public void ShowTooltipAtMouse(string text)
        {
            if (tooltipPanel == null || tooltipText == null) return;
            
            tooltipText.text = text;
            tooltipPanel.SetActive(true);
            
            PositionTooltip(UnityEngine.Input.mousePosition);
        }
        
        private void PositionTooltip(Vector2 screenPosition)
        {
            if (tooltipRect == null) return;
            
            Vector2 finalPosition = screenPosition + offset;
            
            // Keep on screen
            float maxX = Screen.width - tooltipRect.sizeDelta.x;
            float maxY = Screen.height - tooltipRect.sizeDelta.y;
            
            finalPosition.x = Mathf.Clamp(finalPosition.x, 0, maxX);
            finalPosition.y = Mathf.Clamp(finalPosition.y, 0, maxY);
            
            tooltipRect.position = finalPosition;
        }
        
        public void HideTooltip()
        {
            if (tooltipPanel != null)
                tooltipPanel.SetActive(false);
        }
    }
}