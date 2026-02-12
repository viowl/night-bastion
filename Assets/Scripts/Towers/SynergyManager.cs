using UnityEngine;
using System.Collections.Generic;

namespace TowerDefense.Core
{
    public class SynergyManager : MonoBehaviour
    {
        public static SynergyManager Instance { get; private set; }
        
        [System.Serializable]
        public class Synergy
        {
            public string synergyName;
            public TowerType[] requiredTowers;
            public UpgradePath[] requiredPaths;
            public int[] requiredLevels;
            public float maxDistance;
            public SynergyEffect effect;
        }
        
        [System.Serializable]
        public class SynergyEffect
        {
            public float damageBonus;
            public float attackSpeedBonus;
            public float rangeBonus;
            public bool specialEffect;
        }
        
        [Header("Synergies")]
        public List<Synergy> synergies;
        
        private Dictionary<BaseTower, List<Synergy>> activeSynergies = new Dictionary<BaseTower, List<Synergy>>();
        
        private void Awake()
        {
            Instance = this;
        }
        
        public void CheckSynergies(BaseTower tower)
        {
            // Remove old synergies for this tower
            if (activeSynergies.ContainsKey(tower))
            {
                activeSynergies[tower].Clear();
            }
            else
            {
                activeSynergies[tower] = new List<Synergy>();
            }
            
            // Check all synergies
            foreach (var synergy in synergies)
            {
                if (CheckSynergyConditions(tower, synergy))
                {
                    activeSynergies[tower].Add(synergy);
                    ApplySynergyEffect(tower, synergy);
                }
            }
        }
        
        private bool CheckSynergyConditions(BaseTower tower, Synergy synergy)
        {
            // Check if tower matches first requirement
            if (tower.TowerType != synergy.requiredTowers[0])
                return false;
            
            if (tower.CurrentPath != synergy.requiredPaths[0])
                return false;
            
            if (tower.CurrentLevel < synergy.requiredLevels[0])
                return false;
            
            // Check for other required towers
            for (int i = 1; i < synergy.requiredTowers.Length; i++)
            {
                bool found = false;
                
                // Search nearby towers
                var nearbyTowers = GetNearbyTowers(tower.transform.position, synergy.maxDistance);
                foreach (var otherTower in nearbyTowers)
                {
                    if (otherTower == tower) continue;
                    
                    if (otherTower.TowerType == synergy.requiredTowers[i] &&
                        otherTower.CurrentPath == synergy.requiredPaths[i] &&
                        otherTower.CurrentLevel >= synergy.requiredLevels[i])
                    {
                        found = true;
                        break;
                    }
                }
                
                if (!found)
                    return false;
            }
            
            return true;
        }
        
        private List<BaseTower> GetNearbyTowers(Vector3 position, float radius)
        {
            List<BaseTower> nearby = new List<BaseTower>();
            
            var allTowers = FindObjectsOfType<BaseTower>();
            foreach (var tower in allTowers)
            {
                if (Vector3.Distance(position, tower.transform.position) <= radius)
                {
                    nearby.Add(tower);
                }
            }
            
            return nearby;
        }
        
        private void ApplySynergyEffect(BaseTower tower, Synergy synergy)
        {
            Debug.Log($"Synergy activated: {synergy.synergyName} on {tower.name}");
            
            // Apply visual effect
            // This would spawn a particle effect or change the tower's appearance
        }
        
        public List<Synergy> GetActiveSynergies(BaseTower tower)
        {
            if (activeSynergies.ContainsKey(tower))
                return activeSynergies[tower];
            return new List<Synergy>();
        }
    }
}