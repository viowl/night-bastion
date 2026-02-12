using UnityEngine;
using System.Collections.Generic;

namespace TowerDefense.Core
{
    [CreateAssetMenu(fileName = "EnemyData", menuName = "Tower Defense/Enemy Data")]
    public class EnemyData : ScriptableObject
    {
        [Header("Basic Info")]
        public string enemyName;
        public EnemyType enemyType;
        public ArmorType armorType;
        public string description;
        
        [Header("Stats")]
        public float baseHealth = 50f;
        public float baseSpeed = 3.5f;
        public int goldReward = 8;
        public int livesCost = 1;
        
        [Header("Visuals")]
        public Sprite sprite;
        public Color color = Color.white;
        public Vector3 scale = Vector3.one;
        
        [Header("Effects")]
        public GameObject deathEffectPrefab;
        public GameObject spawnEffectPrefab;
        
        [Header("Audio")]
        public AudioClip spawnSound;
        public AudioClip deathSound;
        public AudioClip hitSound;
    }
}