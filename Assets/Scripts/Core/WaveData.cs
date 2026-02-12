using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace TowerDefense.Core
{
    [CreateAssetMenu(fileName = "WaveData", menuName = "Tower Defense/Wave Data")]
    public class WaveData : ScriptableObject
    {
        [System.Serializable]
        public class EnemyGroup
        {
            public EnemyType enemyType;
            public int count = 5;
            public float spawnInterval = 0.5f;
        }
        
        public int waveNumber;
        public List<EnemyGroup> enemyGroups;
        public float timeBetweenGroups = 2f;
        public float preparationTime = 15f;
        public int baseWaveReward = 50;
    }
}