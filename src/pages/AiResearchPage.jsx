import { useState } from 'react';
import { claudeResearch, claudeExtractPlaces, claudeGeneratePlaceInfo } from '../lib/claude';
import { useAiResearch } from '../hooks/useAiResearch';
import { useWishlist } from '../hooks/useWishlist';
import styles from './AiResearchPage.module.css';

export default function AiResearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [lastSavedId, setLastSavedId] = useState(null);
  const [wishlistStep, setWishlistStep] = useState(null);
  const [extractedPlaces, setExtractedPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [wishlistForm, setWishlistForm] = useState({ location: '', memo: '' });
  const [generatingInfo, setGeneratingInfo] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');

  const { saveResearch } = useAiResearch();
  const { addToWishlist } = useWishlist();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult('');
    setShowSaveForm(false);
    setSavedMessage('');
    setWishlistStep(null);
    setWishlistMessage('');
    setSaveTitle(query);
    try {
      const res = await claudeResearch(query);
      setResult(res);
    } catch (e) {
      setResult('エラーが発生しました。もう一度お試しください。');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!saveTitle.trim()) return;
    const data = await saveResearch({ title: saveTitle, query, result });
    if (data) {
      setLastSavedId(data.id);
      setSavedMessage('✅ 保存しました！');
      setShowSaveForm(false);
    }
  };

  const handleWishlistStart = async () => {
    setWishlistStep('extracting');
    try {
      const places = await claudeExtractPlaces(result);
      setExtractedPlaces(places);
      setWishlistStep('selecting');
    } catch (e) {
      setExtractedPlaces([]);
      setWishlistStep('selecting');
    }
  };

  const handleSelectPlace = async (place) => {
    setSelectedPlace(place);
    setWishlistForm({ location: '', memo: '' });
    setGeneratingInfo(true);
    setWishlistStep('filling');
    try {
      const info = await claudeGeneratePlaceInfo(place);
      // ✅ 修正: info.memo → info.notes
      setWishlistForm({ location: info.address || '', memo: info.notes || '' });
    } catch (e) {
      setWishlistForm({ location: '', memo: '' });
    }
    setGeneratingInfo(false);
  };

  const handleAddWishlist = async () => {
    if (!selectedPlace.trim()) return;
    await addToWishlist({
      name: selectedPlace,
      location: wishlistForm.location,
      memo: wishlistForm.memo,
      research_id: lastSavedId,
    });
    setWishlistMessage('⭐ 行きたい場所に追加しました！');
    setWishlistStep(null);
    setSelectedPlace('');
    setWishlistForm({ location: '', memo: '' });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🔍 AI情報収集</h1>

      <div className={styles.searchBox}>
        <input
          className={styles.input}
          type="text"
          placeholder="例：京都の紅葉スポット、沖縄のおすすめビーチ"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className={styles.searchBtn} onClick={handleSearch} disabled={loading}>
          {loading ? '調査中...' : '調べる'}
        </button>
      </div>

      {result && (
        <div className={styles.resultBox}>
          <div className={styles.resultText}>{result}</div>

          <div className={styles.actionRow}>
            {!showSaveForm && !savedMessage && (
              <button className={styles.saveBtn} onClick={() => setShowSaveForm(true)}>
                💾 この結果を保存する
              </button>
            )}
            {showSaveForm && (
              <div className={styles.saveForm}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="保存タイトル"
                  value={saveTitle}
                  onChange={e => setSaveTitle(e.target.value)}
                />
                <div className={styles.formBtns}>
                  <button className={styles.saveBtn} onClick={handleSave}>保存</button>
                  <button className={styles.cancelBtn} onClick={() => setShowSaveForm(false)}>キャンセル</button>
                </div>
              </div>
            )}
            {savedMessage && <p className={styles.message}>{savedMessage}</p>}

            {wishlistStep === null && (
              <button className={styles.wishBtn} onClick={handleWishlistStart}>
                ⭐ 行きたい場所に追加
              </button>
            )}
          </div>

          {wishlistStep === 'extracting' && (
            <div className={styles.extracting}>🔍 場所を抽出中...</div>
          )}

          {wishlistStep === 'selecting' && (
            <div className={styles.wishForm}>
              <p className={styles.wishLabel}>どこに行きたいですか？</p>
              <div className={styles.placeButtons}>
                {extractedPlaces.map(place => (
                  <button key={place} className={styles.placeBtn} onClick={() => handleSelectPlace(place)}>
                    {place}
                  </button>
                ))}
              </div>
              <button className={styles.cancelBtn} onClick={() => setWishlistStep(null)}>キャンセル</button>
            </div>
          )}

          {wishlistStep === 'filling' && (
            <div className={styles.wishForm}>
              <p className={styles.wishLabel}>📍 {selectedPlace}</p>
              {generatingInfo ? (
                <div className={styles.extracting}>✨ 情報を生成中...</div>
              ) : (
                <>
                  <input
                    className={styles.input}
                    placeholder="住所・地域"
                    value={wishlistForm.location}
                    onChange={e => setWishlistForm(f => ({ ...f, location: e.target.value }))}
                  />
                  <textarea
                    className={styles.textarea}
                    placeholder="見どころメモ"
                    value={wishlistForm.memo}
                    rows={4}
                    onChange={e => setWishlistForm(f => ({ ...f, memo: e.target.value }))}
                  />
                  <div className={styles.formBtns}>
                    <button className={styles.wishBtn} onClick={handleAddWishlist}>追加する</button>
                    <button className={styles.cancelBtn} onClick={() => setWishlistStep('selecting')}>← 選び直す</button>
                  </div>
                </>
              )}
            </div>
          )}

          {wishlistMessage && <p className={styles.message}>{wishlistMessage}</p>}
        </div>
      )}
    </div>
  );
}
