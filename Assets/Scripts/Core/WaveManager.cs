using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace TowerDefense.Core
{
    public class WaveManager : MonoBehaviour
    {
        public static WaveManager Instance { get; private set; }
        
        [Header("Configuration")]
        public List<WaveData> waves;
        public Transform spawnPoint;
        public Transform exitPoint;
        
        [Header("Runtime")]
        [SerializeField] private int currentWaveIndex = -1;
        [SerializeField] private bool isWaveActive = false;
        [SerializeField] private bool autoStartWaves = false;
        [SerializeField] private float preparationTimer = 0f;
        [SerializeField] private int enemiesRemainingInWave = 0;
        
        public int CurrentWave => currentWaveIndex + 1;
        public int TotalWaves => waves.Count;
        public bool IsWaveActive => isWaveActive;
        public float PreparationTimer => preparationTimer;
        public int EnemiesRemaining => enemiesRemainingInWave;
        
        private Coroutine currentWaveCoroutine;
        private PathfindingManager pathfinding;
        
        private void Awake()
        {
            Instance = this;
            pathfinding = FindObjectOfType<PathfindingManager>();
        }
        
        private void Start()
        {
            // Wait for game to start
            GameEvents.OnGameStarted += OnGameStarted;
        }
        
        private void Update()
        {
            if (!GameManager.Instance.IsGameActive || isWaveActive) return;
            
            preparationTimer -= Time.deltaTime;
            
            if (preparationTimer <= 0 || autoStartWaves)
            {
                StartNextWave();
            }
        }
        
        private void OnGameStarted()
        {
            StartPreparationPhase();
        }
        
        public void StartNextWave()
        {
            if (currentWaveIndex >= waves.Count - 1) return;
            if (isWaveActive) return;
            
            currentWaveIndex++;
            currentWaveCoroutine = StartCoroutine(RunWave(waves[currentWaveIndex]));
        }
        
        private IEnumerator RunWave(WaveData waveData)
        {
            isWaveActive = true;
            enemiesRemainingInWave = 0;
            
            // Calculate total enemies
            foreach (var group in waveData.enemyGroups)
            {
                enemiesRemainingInWave += group.count;
            }
            
            GameEvents.OnWaveStarted?.Invoke(CurrentWave);
            Debug.Log($"Wave {CurrentWave} started! Enemies: {enemiesRemainingInWave}");
            
            // Get path
            var path = pathfinding.GetCurrentPath();
            if (path == null || path.Count == 0)
            {
                Debug.LogError("No valid path found!");
                isWaveActive = false;
                yield break;
            }
            
            // Spawn enemy groups
            foreach (var group in waveData.enemyGroups)
            {
                for (int i = 0; i < group.count; i++)
                {
                    SpawnEnemy(group.enemyType, path);
                    yield return new WaitForSeconds(group.spawnInterval);
                }
                
                yield return new WaitForSeconds(waveData.timeBetweenGroups);
            }
            
            // Wait for all enemies to be killed or reach exit
            yield return new WaitUntil(() => enemiesRemainingInWave <= 0);
            
            WaveComplete(waveData);
        }
        
        private void SpawnEnemy(EnemyType type, List<Vector3> path)
        {
            var enemy = ObjectPool.Instance.GetEnemy(type);
            if (enemy != null)
            {
                enemy.Initialize(path, CurrentWave);
            }
        }
        
        public void OnEnemyRemoved()
        {
            enemiesRemainingInWave--;
        }
        
        private void WaveComplete(WaveData waveData)
        {
            isWaveActive = false;
            
            // Calculate rewards
            int waveReward = waveData.baseWaveReward + (CurrentWave * 10);
            GameManager.Instance.AddGold(waveReward);
            
            // Apply interest
            ApplyInterest();
            
            GameEvents.OnWaveCompleted?.Invoke(CurrentWave, waveReward);
            Debug.Log($"Wave {CurrentWave} completed! Reward: {waveReward} gold");
            
            if (currentWaveIndex >= waves.Count - 1)
            {
                GameEvents.OnAllWavesCompleted?.Invoke();
                GameEvents.OnVictory?.Invoke();
            }
            else
            {
                StartPreparationPhase();
            }
        }
        
        private void StartPreparationPhase()
        {
            if (currentWaveIndex + 1 < waves.Count)
            {
                preparationTimer = waves[currentWaveIndex + 1].preparationTime;
                GameEvents.OnPreparationPhaseStarted?.Invoke(preparationTimer);
            }
        }
        
        private void ApplyInterest()
        {
            int interest = Mathf.Min(Mathf.FloorToInt(GameManager.Instance.CurrentGold * 0.1f), 50);
            if (interest > 0)
            {
                GameManager.Instance.AddGold(interest);
                GameEvents.OnInterestApplied?.Invoke(interest);
            }
        }
        
        public void SetAutoStart(bool autoStart)
        {
            autoStartWaves = autoStart;
        }
        
        public void SkipPreparation()
        {
            if (!isWaveActive && preparationTimer > 0)
            {
                preparationTimer = 0;
            }
        }
    }
}