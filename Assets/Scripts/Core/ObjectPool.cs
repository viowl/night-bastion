using System.Collections.Generic;
using UnityEngine;

namespace TowerDefense.Core
{
    public class ObjectPool : MonoBehaviour
    {
        public static ObjectPool Instance { get; private set; }
        
        [System.Serializable]
        public class Pool
        {
            public string tag;
            public GameObject prefab;
            public int size;
        }
        
        [Header("Pool Configuration")]
        public List<Pool> pools;
        public Dictionary<string, Queue<GameObject>> poolDictionary;
        
        private void Awake()
        {
            Instance = this;
            poolDictionary = new Dictionary<string, Queue<GameObject>>();
            
            foreach (var pool in pools)
            {
                Queue<GameObject> objectPool = new Queue<GameObject>();
                
                for (int i = 0; i < pool.size; i++)
                {
                    GameObject obj = Instantiate(pool.prefab);
                    obj.SetActive(false);
                    objectPool.Enqueue(obj);
                }
                
                poolDictionary.Add(pool.tag, objectPool);
            }
        }
        
        public GameObject SpawnFromPool(string tag, Vector3 position, Quaternion rotation)
        {
            if (!poolDictionary.ContainsKey(tag))
            {
                Debug.LogWarning($"Pool with tag {tag} doesn't exist.");
                return null;
            }
            
            if (poolDictionary[tag].Count == 0)
            {
                // Expand pool if empty
                var pool = pools.Find(p => p.tag == tag);
                if (pool != null)
                {
                    GameObject obj = Instantiate(pool.prefab);
                    obj.SetActive(false);
                    poolDictionary[tag].Enqueue(obj);
                }
            }
            
            GameObject objectToSpawn = poolDictionary[tag].Dequeue();
            objectToSpawn.SetActive(true);
            objectToSpawn.transform.position = position;
            objectToSpawn.transform.rotation = rotation;
            
            poolDictionary[tag].Enqueue(objectToSpawn);
            
            return objectToSpawn;
        }
        
        public void ReturnToPool(string tag, GameObject obj)
        {
            if (!poolDictionary.ContainsKey(tag))
            {
                Debug.LogWarning($"Pool with tag {tag} doesn't exist.");
                Destroy(obj);
                return;
            }
            
            obj.SetActive(false);
        }
        
        // Specific methods for Enemy pooling
        public Enemy GetEnemy(EnemyType type)
        {
            string tag = type.ToString();
            GameObject obj = SpawnFromPool(tag, Vector3.zero, Quaternion.identity);
            
            if (obj != null && obj.TryGetComponent<Enemy>(out var enemy))
            {
                return enemy;
            }
            
            return null;
        }
        
        public void ReturnEnemy(Enemy enemy)
        {
            string tag = enemy.EnemyType.ToString();
            ReturnToPool(tag, enemy.gameObject);
        }
    }
}