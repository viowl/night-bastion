using UnityEngine;
using TMPro;
using UnityEngine.UI;

namespace TowerDefense.UI
{
    public class GameHUD : MonoBehaviour
    {
        [Header("Resource Displays")]
        public TextMeshProUGUI goldText;
        public TextMeshProUGUI livesText;
        public TextMeshProUGUI waveText;
        public TextMeshProUGUI timerText;
        
        [Header("Wave Info")]
        public TextMeshProUGUI enemiesRemainingText;
        public Slider waveProgressSlider;
        public Image waveProgressFill;
        
        [Header("Tower Selection")]
        public GameObject towerSelectionPanel;
        public Button[] towerButtons;
        public TextMeshProUGUI[] towerCostTexts;
        
        [Header("Game State")]
        public GameObject gameOverPanel;
        public GameObject victoryPanel;
        public GameObject pausePanel;
        public Button pauseButton;
        public Button resumeButton;
        public Button restartButton;
        public Button mainMenuButton;
        
        [Header("Speed Control")]
        public Button speedButton;
        public TextMeshProUGUI speedText;
        
        [Header("Colors")]
        public Color normalColor = Color.white;
        public Color warningColor = Color.red;
        public Color highlightColor = Color.yellow;
        
        private float[] timeScales = { 1f, 2f };
        private int currentSpeedIndex = 0;
        
        private void Start()
        {
            SetupButtons();
            SubscribeToEvents();
            UpdateAllDisplays();
        }
        
        private void SetupButtons()
        {
            // Tower buttons
            for (int i = 0; i < towerButtons.Length; i++)
            {
                int index = i;
                towerButtons[i].onClick.AddListener(() => OnTowerButtonClicked(index));
            }
            
            // Speed button
            if (speedButton != null)
                speedButton.onClick.AddListener(ToggleSpeed);
            
            // Pause/Resume
            if (pauseButton != null)
                pauseButton.onClick.AddListener(() => Core.GameManager.Instance.TogglePause());
            
            if (resumeButton != null)
                resumeButton.onClick.AddListener(() => Core.GameManager.Instance.ResumeGame());
            
            // Restart
            if (restartButton != null)
                restartButton.onClick.AddListener(() => Core.GameManager.Instance.RestartGame());
        }
        
        private void SubscribeToEvents()
        {
            Core.GameEvents.OnGoldChanged += OnGoldChanged;
            Core.GameEvents.OnLivesChanged += OnLivesChanged;
            Core.GameEvents.OnWaveStarted += OnWaveStarted;
            Core.GameEvents.OnWaveCompleted += OnWaveCompleted;
            Core.GameEvents.OnPreparationPhaseStarted += OnPreparationPhaseStarted;
            Core.GameEvents.OnGameOver += OnGameOver;
            Core.GameEvents.OnVictory += OnVictory;
            Core.GameEvents.OnGamePaused += OnGamePaused;
            Core.GameEvents.OnGameResumed += OnGameResumed;
        }
        
        private void OnDestroy()
        {
            Core.GameEvents.OnGoldChanged -= OnGoldChanged;
            Core.GameEvents.OnLivesChanged -= OnLivesChanged;
            Core.GameEvents.OnWaveStarted -= OnWaveStarted;
            Core.GameEvents.OnWaveCompleted -= OnWaveCompleted;
            Core.GameEvents.OnPreparationPhaseStarted -= OnPreparationPhaseStarted;
            Core.GameEvents.OnGameOver -= OnGameOver;
            Core.GameEvents.OnVictory -= OnVictory;
            Core.GameEvents.OnGamePaused -= OnGamePaused;
            Core.GameEvents.OnGameResumed -= OnGameResumed;
        }
        
        private void Update()
        {
            UpdateTimer();
            UpdateWaveProgress();
        }
        
        private void UpdateAllDisplays()
        {
            OnGoldChanged(Core.GameManager.Instance.CurrentGold);
            OnLivesChanged(Core.GameManager.Instance.CurrentLives);
            
            if (Core.WaveManager.Instance != null)
            {
                UpdateWaveText();
            }
        }
        
        private void OnGoldChanged(int gold)
        {
            if (goldText != null)
            {
                goldText.text = $"Gold: {gold}";
            }
            
            // Update tower button interactability
            UpdateTowerButtons(gold);
        }
        
        private void OnLivesChanged(int lives)
        {
            if (livesText != null)
            {
                livesText.text = $"Lives: {lives}";
                livesText.color = lives <= 5 ? warningColor : normalColor;
            }
        }
        
        private void OnWaveStarted(int waveNumber)
        {
            UpdateWaveText();
            
            if (timerText != null)
                timerText.text = "Wave In Progress";
        }
        
        private void OnWaveCompleted(int waveNumber, int reward)
        {
            UpdateWaveText();
        }
        
        private void OnPreparationPhaseStarted(float time)
        {
            if (timerText != null)
                timerText.text = $"Next Wave: {Mathf.CeilToInt(time)}s";
        }
        
        private void UpdateTimer()
        {
            if (Core.WaveManager.Instance == null) return;
            
            if (!Core.WaveManager.Instance.IsWaveActive && Core.WaveManager.Instance.PreparationTimer > 0)
            {
                if (timerText != null)
                    timerText.text = $"Next Wave: {Mathf.CeilToInt(Core.WaveManager.Instance.PreparationTimer)}s";
            }
        }
        
        private void UpdateWaveText()
        {
            if (waveText != null && Core.WaveManager.Instance != null)
            {
                waveText.text = $"Wave: {Core.WaveManager.Instance.CurrentWave}/{Core.WaveManager.Instance.TotalWaves}";
            }
        }
        
        private void UpdateWaveProgress()
        {
            if (Core.WaveManager.Instance == null) return;
            
            if (enemiesRemainingText != null)
            {
                enemiesRemainingText.text = $"Enemies: {Core.WaveManager.Instance.EnemiesRemaining}";
            }
            
            // Update slider based on wave progress
            if (waveProgressSlider != null && Core.WaveManager.Instance.IsWaveActive)
            {
                // This would need total enemy count to calculate percentage
                // For now, just show activity
            }
        }
        
        private void UpdateTowerButtons(int currentGold)
        {
            if (Input.BuildController.Instance == null) return;
            
            var towerDatas = Input.BuildController.Instance.towerDatas;
            
            for (int i = 0; i < towerButtons.Length && i < towerDatas.Length; i++)
            {
                bool canAfford = currentGold >= towerDatas[i].baseCost;
                towerButtons[i].interactable = canAfford;
                
                // Update cost text color
                if (towerCostTexts != null && i < towerCostTexts.Length)
                {
                    towerCostTexts[i].color = canAfford ? normalColor : warningColor;
                }
            }
        }
        
        private void OnTowerButtonClicked(int index)
        {
            Input.BuildController.Instance.SelectTower(index);
        }
        
        private void ToggleSpeed()
        {
            currentSpeedIndex = (currentSpeedIndex + 1) % timeScales.Length;
            Time.timeScale = timeScales[currentSpeedIndex];
            
            if (speedText != null)
                speedText.text = $"{timeScales[currentSpeedIndex]}x";
        }
        
        private void OnGameOver()
        {
            if (gameOverPanel != null)
                gameOverPanel.SetActive(true);
        }
        
        private void OnVictory()
        {
            if (victoryPanel != null)
                victoryPanel.SetActive(true);
        }
        
        private void OnGamePaused()
        {
            if (pausePanel != null)
                pausePanel.SetActive(true);
        }
        
        private void OnGameResumed()
        {
            if (pausePanel != null)
                pausePanel.SetActive(false);
        }
    }
}