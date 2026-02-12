using System;
using UnityEngine;

namespace TowerDefense.Core
{
    public static class GameEvents
    {
        // Economy Events
        public static Action<int> OnGoldChanged;
        public static Action<int> OnLivesChanged;
        public static Action<int> OnInterestApplied;
        
        // Tower Events
        public static Action<BaseTower> OnTowerBuilt;
        public static Action<BaseTower, UpgradePath, int> OnTowerUpgraded;
        public static Action<BaseTower> OnTowerSold;
        
        // Enemy Events
        public static Action<Enemy> OnEnemySpawned;
        public static Action<Enemy> OnEnemyKilled;
        public static Action<Enemy> OnEnemyReachedExit;
        
        // Wave Events
        public static Action<int> OnWaveStarted;
        public static Action<int, int> OnWaveCompleted;
        public static Action<float> OnPreparationPhaseStarted;
        public static Action OnAllWavesCompleted;
        public static Action OnVictory;
        public static Action OnGameOver;
        
        // Game State Events
        public static Action OnGameStarted;
        public static Action OnGamePaused;
        public static Action OnGameResumed;
        public static Action OnGameRestarted;
        
        // Input Events
        public static Action<Vector3> OnGridCellHovered;
        public static Action<Vector3> OnGridCellClicked;
        public static Action OnBuildCancelled;
    }
}