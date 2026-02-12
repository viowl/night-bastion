using UnityEngine;
using System.Collections.Generic;

namespace TowerDefense.Core
{
    public class EnemyTracker : MonoBehaviour
    {
        public static EnemyTracker Instance { get; private set; }
        
        private List<Enemy> activeEnemies = new List<Enemy>();
        
        public int ActiveEnemyCount => activeEnemies.Count;
        public List<Enemy> ActiveEnemies => new List<Enemy>(activeEnemies);
        
        private void Awake()
        {
            Instance = this;
        }
        
        private void OnEnable()
        {
            GameEvents.OnEnemySpawned += OnEnemySpawned;
            GameEvents.OnEnemyKilled += OnEnemyRemoved;
            GameEvents.OnEnemyReachedExit += OnEnemyRemoved;
        }
        
        private void OnDisable()
        {
            GameEvents.OnEnemySpawned -= OnEnemySpawned;
            GameEvents.OnEnemyKilled -= OnEnemyRemoved;
            GameEvents.OnEnemyReachedExit -= OnEnemyRemoved;
        }
        
        private void OnEnemySpawned(Enemy enemy)
        {
            if (!activeEnemies.Contains(enemy))
            {
                activeEnemies.Add(enemy);
            }
        }
        
        private void OnEnemyRemoved(Enemy enemy)
        {
            if (activeEnemies.Contains(enemy))
            {
                activeEnemies.Remove(enemy);
            }
            
            // Notify wave manager
            WaveManager.Instance?.OnEnemyRemoved();
        }
        
        public void RegisterEnemy(Enemy enemy)
        {
            if (!activeEnemies.Contains(enemy))
            {
                activeEnemies.Add(enemy);
            }
        }
        
        public Enemy GetClosestEnemy(Vector3 position, float maxRange = float.MaxValue)
        {
            Enemy closest = null;
            float closestDistance = maxRange;
            
            foreach (var enemy in activeEnemies)
            {
                if (enemy == null || enemy.IsDead) continue;
                
                float distance = Vector3.Distance(position, enemy.transform.position);
                if (distance < closestDistance)
                {
                    closestDistance = distance;
                    closest = enemy;
                }
            }
            
            return closest;
        }
        
        public List<Enemy> GetEnemiesInRange(Vector3 position, float range)
        {
            List<Enemy> enemiesInRange = new List<Enemy>();
            
            foreach (var enemy in activeEnemies)
            {
                if (enemy == null || enemy.IsDead) continue;
                
                float distance = Vector3.Distance(position, enemy.transform.position);
                if (distance <= range)
                {
                    enemiesInRange.Add(enemy);
                }
            }
            
            return enemiesInRange;
        }
        
        public void ClearAllEnemies()
        {
            activeEnemies.Clear();
        }
    }
}