using UnityEngine;
using UnityEngine.SceneManagement;

namespace TowerDefense.Core
{
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }
        
        [Header("Game Settings")]
        public int startingLives = 20;
        public int startingGold = 150;
        public bool autoStartWaves = false;
        
        [Header("Game State")]
        [SerializeField] private int currentLives;
        [SerializeField] private int currentGold;
        [SerializeField] private bool isGameActive = false;
        [SerializeField] private bool isPaused = false;
        
        public int CurrentLives => currentLives;
        public int CurrentGold => currentGold;
        public bool IsGameActive => isGameActive;
        public bool IsPaused => isPaused;
        
        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        
        private void Start()
        {
            StartGame();
        }
        
        private void OnEnable()
        {
            GameEvents.OnEnemyReachedExit += OnEnemyReachedExit;
            GameEvents.OnVictory += OnVictory;
        }
        
        private void OnDisable()
        {
            GameEvents.OnEnemyReachedExit -= OnEnemyReachedExit;
            GameEvents.OnVictory -= OnVictory;
        }
        
        public void StartGame()
        {
            currentLives = startingLives;
            currentGold = startingGold;
            isGameActive = true;
            isPaused = false;
            
            GameEvents.OnGoldChanged?.Invoke(currentGold);
            GameEvents.OnLivesChanged?.Invoke(currentLives);
            GameEvents.OnGameStarted?.Invoke();
        }
        
        public void AddGold(int amount)
        {
            currentGold += amount;
            GameEvents.OnGoldChanged?.Invoke(currentGold);
        }
        
        public bool SpendGold(int amount)
        {
            if (currentGold >= amount)
            {
                currentGold -= amount;
                GameEvents.OnGoldChanged?.Invoke(currentGold);
                return true;
            }
            return false;
        }
        
        public void LoseLife(int amount = 1)
        {
            currentLives -= amount;
            GameEvents.OnLivesChanged?.Invoke(currentLives);
            
            if (currentLives <= 0)
            {
                GameOver();
            }
        }
        
        private void OnEnemyReachedExit(Enemy enemy)
        {
            LoseLife(1);
        }
        
        private void GameOver()
        {
            isGameActive = false;
            GameEvents.OnGameOver?.Invoke();
            Debug.Log("Game Over!");
        }
        
        private void OnVictory()
        {
            isGameActive = false;
            Debug.Log("Victory!");
        }
        
        public void PauseGame()
        {
            isPaused = true;
            Time.timeScale = 0f;
            GameEvents.OnGamePaused?.Invoke();
        }
        
        public void ResumeGame()
        {
            isPaused = false;
            Time.timeScale = 1f;
            GameEvents.OnGameResumed?.Invoke();
        }
        
        public void TogglePause()
        {
            if (isPaused)
                ResumeGame();
            else
                PauseGame();
        }
        
        public void RestartGame()
        {
            Time.timeScale = 1f;
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        }
    }
}