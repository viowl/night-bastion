using UnityEngine;

namespace TowerDefense.Combat
{
    public class Projectile : MonoBehaviour
    {
        [Header("Settings")]
        public float speed = 15f;
        public float lifetime = 5f;
        public bool useHoming = true;
        
        private Core.Enemy target;
        private Core.BaseTower source;
        private float damage;
        private float lifetimeTimer;
        private bool hasDealtDamage = false;
        
        public void Initialize(Core.Enemy targetEnemy, Core.BaseTower sourceTower, float damageAmount)
        {
            target = targetEnemy;
            source = sourceTower;
            damage = damageAmount;
            lifetimeTimer = lifetime;
            hasDealtDamage = false;
            
            // Face target initially
            if (target != null)
            {
                Vector3 direction = (target.transform.position - transform.position).normalized;
                float angle = Mathf.Atan2(direction.y, direction.x) * Mathf.Rad2Deg;
                transform.rotation = Quaternion.AngleAxis(angle, Vector3.forward);
            }
        }
        
        private void Update()
        {
            lifetimeTimer -= Time.deltaTime;
            if (lifetimeTimer <= 0)
            {
                Destroy(gameObject);
                return;
            }
            
            if (target == null || target.IsDead)
            {
                Destroy(gameObject);
                return;
            }
            
            // Move towards target
            Vector3 direction;
            if (useHoming)
            {
                direction = (target.transform.position - transform.position).normalized;
                float angle = Mathf.Atan2(direction.y, direction.x) * Mathf.Rad2Deg;
                transform.rotation = Quaternion.AngleAxis(angle, Vector3.forward);
            }
            else
            {
                direction = transform.right;
            }
            
            transform.position += direction * speed * Time.deltaTime;
            
            // Check for collision
            float distanceToTarget = Vector3.Distance(transform.position, target.transform.position);
            if (distanceToTarget < 0.5f && !hasDealtDamage)
            {
                HitTarget();
            }
        }
        
        private void HitTarget()
        {
            hasDealtDamage = true;
            
            if (target != null && !target.IsDead)
            {
                target.TakeDamage(damage, source.DamageType);
                
                // Notify tower
                if (source is Towers.ArcherTower archer)
                {
                    // Apply any special effects through the tower
                }
            }
            
            Destroy(gameObject);
        }
        
        private void OnTriggerEnter2D(Collider2D other)
        {
            if (hasDealtDamage) return;
            
            if (other.TryGetComponent<Core.Enemy>(out var enemy))
            {
                if (enemy == target)
                {
                    HitTarget();
                }
            }
        }
    }
}