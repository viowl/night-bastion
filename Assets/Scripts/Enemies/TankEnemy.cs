using UnityEngine;

namespace TowerDefense.Enemies
{
    public class TankEnemy : Core.Enemy
    {
        // Tank blocks path for other enemies
        // This is handled by the GridManager marking this cell as unwalkable
        
        protected override void Awake()
        {
            base.Awake();
        }
        
        protected override void Die()
        {
            // Remove blocking before dying
            base.Die();
        }
    }
}