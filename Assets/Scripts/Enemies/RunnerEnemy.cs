using UnityEngine;

namespace TowerDefense.Enemies
{
    public class RunnerEnemy : Core.Enemy
    {
        [Header("Runner Settings")]
        public float speedBoostThreshold = 0.25f;
        public float speedBoostMultiplier = 1.7f;
        
        private bool isBoosted = false;
        
        protected override void Update()
        {
            base.Update();
            
            // Check for speed boost
            if (!isBoosted && CurrentHealth / MaxHealth <= speedBoostThreshold)
            {
                ApplySpeedBoost();
            }
        }
        
        private void ApplySpeedBoost()
        {
            isBoosted = true;
            currentSpeed *= speedBoostMultiplier;
            
            // Visual indicator
            if (spriteRenderer != null)
            {
                spriteRenderer.color = Color.red;
            }
        }
    }
}