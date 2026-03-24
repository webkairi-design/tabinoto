import { useState } from 'react';
import { useAiResearch } from '../hooks/useAiResearch';
import { useWishlist } from '../hooks/useWishlist';
import styles from './AiResearchListPage.module.css';

export default function AiResearchListPage() {
  const { researches, loading, deleteResearch } = useAiResearch();
  const { addToWishlist } = useWishlist();
  const [expanded, setExpanded] = useState(null);
  const [wishlistForm, setWishlistForm] = useState({ show: false, researchId: null, name: '', location: '', memo: '' });
  const [wishlistMessage, setWishlistMessage] = useState('');

  const handleAddWishlist = async () => {
    if (!wishlistForm.name.trim()) return;
    await addToWishlist({
      name: wishlistForm.name,
      location: wishlistForm.location,
      memo: wishlistForm.memo,
      research_id: wishlistForm.researchId,
    });
    setWishlistMessage('⭐ 行きたい場所に追加しました！');
    setWishlistForm({ show: false, researchId: null, name: '', location: '', memo: '' });
    setTimeout(() => setWishlistMessage(''), 3000);
  };

  if (loading) return <div className={styles.container}>読み込み中...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📚 保存済みAI調査</h1>

      {wishlistMessage && <p className={styles.globalMessage}>{wishlistMessage}</p>}

      {researches.length === 0 ? (
        <p className={styles.empty}>保存された調査結果はありません。<br />AI情報収集ページで調べた結果を保存してみましょう！</p>
      ) : (
        <div className={styles.list}>
          {researches.map(r => (
            <div key={r.id} className={styles.card}>
              <div className={styles.cardHeader} onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <div>
                  <h2 className={styles.cardTitle}>{r.title}</h2>
                  <p className={styles.cardMeta}>🔍 {r.query} · {new Date(r.created_at).toLocaleDateString('ja-JP')}</p>
                </div>
                <span className={styles.toggle}>{expanded === r.id ? '▲' : '▼'}</span>
              </div>

              {expanded === r.id && (
                <div className={styles.cardBody}>
                  <div className={styles.resultText}>{r.result}</div>
                  <div className={styles.actionRow}>
                    <button
                      className={styles.wishBtn}
                      onClick={() => setWishlistForm({ show: true, researchId: r.id, name: '', location: '', memo: '' })}
                    >
                      ⭐ 行きたい場所に追加
                    </button>
                    <button className={styles.deleteBtn} onClick={() => deleteResearch(r.id)}>
                      🗑️ 削除
                    </button>
                  </div>

                  {wishlistForm.show && wishlistForm.researchId === r.id && (
                    <div className={styles.wishForm}>
                      <input
                        className={styles.input}
                        placeholder="場所の名前（例：嵐山）"
                        value={wishlistForm.name}
                        onChange={e => setWishlistForm(f => ({ ...f, name: e.target.value }))}
                      />
                      <input
                        className={styles.input}
                        placeholder="住所・地域（任意）"
                        value={wishlistForm.location}
                        onChange={e => setWishlistForm(f => ({ ...f, location: e.target.value }))}
                      />
                      <input
                        className={styles.input}
                        placeholder="メモ（任意）"
                        value={wishlistForm.memo}
                        onChange={e => setWishlistForm(f => ({ ...f, memo: e.target.value }))}
                      />
                      <div className={styles.formBtns}>
                        <button className={styles.wishBtn} onClick={handleAddWishlist}>追加する</button>
                        <button className={styles.cancelBtn} onClick={() => setWishlistForm({ show: false, researchId: null, name: '', location: '', memo: '' })}>キャンセル</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}