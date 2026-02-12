using UnityEngine;

namespace TowerDefense.Core
{
    [CreateAssetMenu(fileName = "TowerData", menuName = "Tower Defense/Tower Data")]
    public class TowerData : ScriptableObject
    {
        [Header("Basic Info")]
        public string towerName;
        public TowerType towerType;
        public DamageType damageType;
        public string description;
        
        [Header("Base Stats")]
        public int baseCost = 50;
        public float baseDamage = 15f;
        public float baseAttackSpeed = 1f;
        public float baseRange = 8f;
        public bool canTargetFlying = false;
        
        [Header("Visuals")]
        public Sprite[] levelSprites;
        public GameObject projectilePrefab;
        public GameObject buildEffectPrefab;
        public GameObject upgradeEffectPrefab;
        
        [Header("Audio")]
        public AudioClip attackSound;
        public AudioClip buildSound;
        public AudioClip upgradeSound;
        
        [Header("Upgrade Data")]
        public UpgradeBranch[] upgradeBranches;
    }
    
    [System.Serializable]
    public class UpgradeBranch
    {
        public string branchName;
        public UpgradePath path;
        public UpgradeLevel[] levels;
    }
    
    [System.Serializable]
    public class UpgradeLevel
    {
        public int level;
        public int cost;
        public float damageBonus;
        public float attackSpeedBonus;
        public float rangeBonus;
        public string specialAbility;
        public string description;
    }
}