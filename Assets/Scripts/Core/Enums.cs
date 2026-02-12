using UnityEngine;

namespace TowerDefense.Core
{
    public enum DamageType
    {
        Physical,
        Magic,
        Pure
    }
    
    public enum ArmorType
    {
        Light,
        Heavy,
        MagicImmune,
        Ethereal
    }
    
    public enum EnemyType
    {
        Grunt,
        Runner,
        Tank,
        Flyer,
        Warlord
    }
    
    public enum TowerType
    {
        Archer,
        Crystal,
        Vault
    }
    
    public enum UpgradePath
    {
        None,
        BranchA,
        BranchB,
        BranchC
    }
    
    public enum DebuffType
    {
        Poison,
        Slow,
        Stun,
        ArmorReduction
    }
}