using UnityEngine;

namespace TowerDefense.Core
{
    public static class DamageCalculator
    {
        public static float GetMultiplier(ArmorType armor, DamageType damage)
        {
            switch (damage)
            {
                case DamageType.Physical:
                    switch (armor)
                    {
                        case ArmorType.Light: return 1.0f;
                        case ArmorType.Heavy: return 0.5f;
                        case ArmorType.MagicImmune: return 1.0f;
                        case ArmorType.Ethereal: return 0.0f;
                    }
                    break;
                    
                case DamageType.Magic:
                    switch (armor)
                    {
                        case ArmorType.Light: return 1.0f;
                        case ArmorType.Heavy: return 1.5f;
                        case ArmorType.MagicImmune: return 0.0f;
                        case ArmorType.Ethereal: return 1.25f;
                    }
                    break;
                    
                case DamageType.Pure:
                    return 1.0f;
            }
            
            return 1.0f;
        }
        
        public static string GetMultiplierDescription(ArmorType armor, DamageType damage)
        {
            float multiplier = GetMultiplier(armor, damage);
            
            if (multiplier >= 1.5f) return "Strong";
            if (multiplier >= 1.0f) return "Normal";
            if (multiplier > 0f) return "Weak";
            return "Immune";
        }
    }
}