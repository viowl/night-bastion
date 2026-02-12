using UnityEngine;

namespace TowerDefense.Enemies
{
    public class FlyerEnemy : Core.Enemy
    {
        // Flyers ignore maze and go straight to exit
        
        protected override void MoveAlongPath()
        {
            // Flyers move directly towards exit
            if (Core.WaveManager.Instance == null) return;
            
            Vector3 exitPosition = Core.WaveManager.Instance.exitPoint.position;
            Vector3 direction = (exitPosition - transform.position).normalized;
            float actualSpeed = currentSpeed * slowMultiplier;
            
            transform.position += direction * actualSpeed * Time.deltaTime;
            
            // Check if reached exit
            if (Vector3.Distance(transform.position, exitPosition) < 0.5f)
            {
                ReachExit();
            }
            
            // Face movement direction
            if (spriteRenderer != null && direction.x != 0)
            {
                spriteRenderer.flipX = direction.x < 0;
            }
        }
    }
}