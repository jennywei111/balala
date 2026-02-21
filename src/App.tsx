/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  Share2, 
  Trophy,
  Coffee,
  Zap,
  AlertCircle,
  Dices,
  Info,
  Gift,
  Skull,
  Wallet,
  Utensils,
  ChevronRight,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Constants & Types ---
const LIFF_ID = "YOUR_LIFF_ID";

const MISSION_DETAILS = {
  date: "2026/03/08 (日)",
  time: "12:00",
  location: "豐生茶館",
  deposit: 100,
  deadline: "2/25 截止",
  note: "各家庭自行結帳，訂金現場折抵"
};

const FOOD_ITEMS = [
  { icon: "🍱", name: "招牌便當" },
  { icon: "🧋", name: "珍珠奶茶" },
  { icon: "🥟", name: "手工水餃" },
  { icon: "🍗", name: "酥炸雞腿" }
];

type TileType = 'start' | 'info' | 'chance' | 'destiny' | 'food';

interface Tile {
  id: number;
  type: TileType;
  label: string;
  icon: React.ReactNode | string;
  description: string;
  foodIndex?: number;
}

// Initial board layout (12 tiles)
const INITIAL_TILES: Tile[] = [
  { id: 0, type: 'start', label: '起點', icon: <Coffee className="w-5 h-5" />, description: '準備出發！' },
  { id: 1, type: 'info', label: '茶館', icon: <Info className="w-5 h-5" />, description: '豐生茶館歡迎您。' },
  { id: 2, type: 'chance', label: '機會', icon: <Gift className="w-5 h-5" />, description: '吧拉拉的驚喜？' },
  { id: 3, type: 'food', label: '美食', icon: '❓', description: '這裡有什麼好吃的？' },
  { id: 4, type: 'destiny', label: '命運', icon: <Skull className="w-5 h-5" />, description: '挑戰來襲！' },
  { id: 5, type: 'food', label: '美食', icon: '❓', description: '聞到香味了。' },
  { id: 6, type: 'chance', label: '機會', icon: <Gift className="w-5 h-5" />, description: '運氣也是實力。' },
  { id: 7, type: 'info', label: '訂金', icon: <Wallet className="w-5 h-5" />, description: '記得 2/25 期限。' },
  { id: 8, type: 'food', label: '美食', icon: '❓', description: '必點清單之一。' },
  { id: 9, type: 'destiny', label: '命運', icon: <Skull className="w-5 h-5" />, description: '梅川東路大塞車？' },
  { id: 10, type: 'food', label: '美食', icon: '❓', description: '最後一個食材？' },
  { id: 11, type: 'chance', label: '機會', icon: <Gift className="w-5 h-5" />, description: '吧拉拉的應援。' },
];

const TILE_POSITIONS = [
  { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 },
  { r: 2, c: 4 }, { r: 3, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 3 },
  { r: 4, c: 2 }, { r: 4, c: 1 }, { r: 3, c: 1 }, { r: 2, c: 1 },
];

export default function App() {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [board, setBoard] = useState<Tile[]>(INITIAL_TILES);
  const [currentTile, setCurrentTile] = useState(0);
  const [laps, setLaps] = useState(0);
  const [totalRolls, setTotalRolls] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(1);
  const [collectedFoods, setCollectedFoods] = useState<number[]>([]);
  const [userProfile, setUserProfile] = useState<{ displayName: string; pictureUrl: string } | null>(null);
  const [eventModal, setEventModal] = useState<{ title: string; msg: string; type: 'good' | 'bad' | 'info'; action?: () => void } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [peopleCount, setPeopleCount] = useState(1);
  const [restSeconds, setRestSeconds] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  // Rest Countdown Timer
  useEffect(() => {
    if (restSeconds > 0) {
      const timer = setTimeout(() => setRestSeconds(restSeconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [restSeconds]);

  // Initialize Board with random food positions
  useEffect(() => {
    const foodTiles = [3, 5, 8, 10];
    const shuffledFood = [...FOOD_ITEMS].sort(() => Math.random() - 0.5);
    const newBoard = [...INITIAL_TILES];
    foodTiles.forEach((tileIdx, i) => {
      newBoard[tileIdx] = {
        ...newBoard[tileIdx],
        icon: shuffledFood[i].icon,
        label: shuffledFood[i].name,
        foodIndex: i
      };
    });
    setBoard(newBoard);
  }, []);

  // LIFF Initialization
  useEffect(() => {
    const initLiff = async () => {
      try {
        // @ts-ignore
        await liff.init({ liffId: LIFF_ID });
        // @ts-ignore
        if (liff.isLoggedIn()) {
          // @ts-ignore
          const profile = await liff.getProfile();
          setUserProfile({
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl || 'https://picsum.photos/seed/user/100/100'
          });
        } else {
          setUserProfile({ displayName: "吃貨跑者", pictureUrl: "https://picsum.photos/seed/foodie/100/100" });
        }
      } catch (err) {
        setUserProfile({ displayName: "訪客", pictureUrl: "https://picsum.photos/seed/guest/100/100" });
      }
    };
    initLiff();
  }, []);

  const vibrate = (pattern: number | number[]) => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  };

  const checkGameEnd = (currentLaps: number, currentFoods: number[]) => {
    if (currentFoods.length === 4 || currentLaps >= 5) {
      setGameState('finished');
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      return true;
    }
    return false;
  };

  const handleTileLanding = (tileId: number, currentLaps: number, currentFoods: number[]) => {
    const tile = board[tileId];
    vibrate(50);

    if (checkGameEnd(currentLaps, currentFoods)) return;

    // Food Collection
    if (tile.type === 'food' && tile.foodIndex !== undefined) {
      if (!currentFoods.includes(tile.foodIndex)) {
        const newFoods = [...currentFoods, tile.foodIndex];
        setCollectedFoods(newFoods);
        setEventModal({
          title: `🍱 獲得食材：${tile.label}！`,
          msg: `太棒了！收集進度：${newFoods.length}/4。再接再厲！`,
          type: 'good'
        });
        vibrate([100, 50, 100]);
        if (checkGameEnd(currentLaps, newFoods)) return;
      }
    }

    // Event Logic
    if (tile.type === 'chance') {
      const rand = Math.random();
      if (rand > 0.5) {
        setEventModal({
          title: "🍀 機會：吧拉拉應援！",
          msg: "吧拉拉導播幫你推了一把，直接前進 3 格！",
          type: 'good',
          action: () => movePlayer(3)
        });
      } else {
        // Give a random missing food
        const missing = [0, 1, 2, 3].filter(i => !currentFoods.includes(i));
        if (missing.length > 0) {
          const gift = missing[Math.floor(Math.random() * missing.length)];
          const newFoods = [...currentFoods, gift];
          setCollectedFoods(newFoods);
          setEventModal({
            title: "🍀 機會：吧拉拉的愛心便當",
            msg: `吧拉拉直接送你一個【${FOOD_ITEMS[gift].name}】！收集進度：${newFoods.length}/4。`,
            type: 'good'
          });
          checkGameEnd(currentLaps, newFoods);
        } else {
          setEventModal({
            title: "🍀 機會：體力充沛",
            msg: "吧拉拉說你表現很好，下一抽骰子點數必大於 3！",
            type: 'good'
          });
        }
      }
    } else if (tile.type === 'destiny') {
      const rand = Math.random();
      if (rand < 0.33) {
        vibrate(400);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 1000);
        setEventModal({
          title: "⚡ 命運：手機大地震！",
          msg: "畫面劇烈抖動！你被震暈了，原地休息 5 秒。",
          type: 'bad',
          action: () => setRestSeconds(5)
        });
      } else if (rand < 0.66) {
        setEventModal({
          title: "⚡ 命運：梅川東路大塞車",
          msg: "前面的車子完全不動... 你只好退後 2 格。",
          type: 'bad',
          action: () => movePlayer(-2)
        });
      } else {
        setEventModal({
          title: "⚡ 命運：吧拉拉碎碎念",
          msg: "吧拉拉開始講古，你聽得入神忘了前進。休息 5 秒！",
          type: 'info',
          action: () => setRestSeconds(5)
        });
      }
    }
  };

  const movePlayer = async (steps: number) => {
    let nextTile = currentTile;
    let nextLaps = laps;
    const direction = steps > 0 ? 1 : -1;
    const absSteps = Math.abs(steps);

    for (let i = 0; i < absSteps; i++) {
      if (direction > 0) {
        nextTile = (nextTile + 1) % board.length;
        if (nextTile === 0) nextLaps += 1;
      } else {
        nextTile = (nextTile - 1 + board.length) % board.length;
        if (nextTile === board.length - 1) nextLaps = Math.max(0, nextLaps - 1);
      }
      setCurrentTile(nextTile);
      await new Promise(r => setTimeout(r, 200));
    }
    
    setLaps(nextLaps);
    handleTileLanding(nextTile, nextLaps, collectedFoods);
  };

  const rollDice = async () => {
    if (isRolling || eventModal || gameState !== 'playing' || restSeconds > 0) return;
    
    setIsRolling(true);
    vibrate(50);
    setTotalRolls(prev => prev + 1);

    let finalValue = 1;
    for (let i = 0; i < 10; i++) {
      finalValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalValue);
      await new Promise(r => setTimeout(r, 80));
    }

    setIsRolling(false);
    movePlayer(finalValue);
  };

  const getRank = () => {
    if (collectedFoods.length === 4 && totalRolls <= 15) return { title: "梅川東路閃電吃貨 ⚡️", color: "text-yellow-500" };
    if (laps >= 5) return { title: "豐生茶館慢食路霸 🐌", color: "text-gray-500" };
    return { title: "優雅的品茶吃貨 🍵", color: "text-[#8B4513]" };
  };

  const handleShare = async () => {
    const rank = getRank();
    const text = `🎲 我已領取入座證！獲封為【${rank.title}】！\n📅 3/8 12:00 見，我會保護主辦方的玻璃心，在 2/25 前交好訂金！💪`;
    // @ts-ignore
    if (liff.isApiAvailable('shareTargetPicker')) {
      // @ts-ignore
      await liff.shareTargetPicker([{ type: "text", text }]);
    } else {
      alert("分享功能僅限 LINE 環境使用");
    }
  };

  return (
    <div className={`min-h-screen bg-[#FDF5E6] font-sans text-[#4A2C2A] p-4 flex flex-col items-center overflow-hidden select-none transition-transform ${isShaking ? 'animate-shake' : ''}`}>
      
      {/* Intro Modal */}
      <AnimatePresence>
        {gameState === 'intro' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#F5DEB3] rounded-3xl border-4 border-[#8B4513] p-8 w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#8B4513]/20" />
              <Coffee className="w-16 h-16 text-[#8B4513] mx-auto mb-4" />
              <h2 className="text-2xl font-black text-[#8B4513] mb-4">🍵 豐生茶館：<br/>3/8 聚餐特遣任務</h2>
              <div className="text-left space-y-4 text-sm font-medium mb-8">
                <p className="text-[#8B4513] italic">吧拉拉導播報告！為了確保 3/8 (日) 12:00 大家有位子坐，請完成「吃貨報名挑戰」。</p>
                <ul className="space-y-2">
                  <li className="flex gap-2"><span>🍱</span> 收集 4 個必點食材即可報名成功。</li>
                  <li className="flex gap-2"><span>💰</span> 抵達終點確認 $100/人 訂金資訊。</li>
                  <li className="flex gap-2"><span>🐌</span> 若繞行 5 圈仍未集齊，吧拉拉將強制帶你進入領位頁面。</li>
                </ul>
              </div>
              <button 
                onClick={() => setGameState('playing')}
                className="w-full py-4 bg-[#8B4513] text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                了解規則，開始收集！ <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="w-full max-w-md text-center mb-4">
        <motion.h1 className="text-2xl font-black text-[#8B4513] flex items-center justify-center gap-2">
          <Coffee className="w-6 h-6" /> 豐生茶館大富翁
        </motion.h1>
        
        {/* Food Progress */}
        <div className="mt-4 px-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold flex items-center gap-1"><Utensils className="w-3 h-3" /> 食材收集進度</span>
            <span className="text-[10px] font-bold">{collectedFoods.length}/4</span>
          </div>
          <div className="flex gap-1 justify-center">
            {FOOD_ITEMS.map((food, i) => (
              <div 
                key={i} 
                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl transition-all ${
                  collectedFoods.includes(i) ? 'bg-white border-[#F27D26] scale-110 shadow-md' : 'bg-gray-200 border-gray-300 opacity-30 grayscale'
                }`}
              >
                {food.icon}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="w-full max-w-md flex-1 flex flex-col items-center justify-center relative">
        
        {gameState === 'playing' && (
          <>
            {/* Board Grid */}
            <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full aspect-square bg-white/30 p-2 rounded-3xl border-4 border-[#8B4513] relative shadow-xl">
              
              {/* Center Area */}
              <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center bg-[#FDF5E6] rounded-2xl border-2 border-dashed border-[#8B4513]/30">
                <Coffee className="w-10 h-10 text-[#8B4513] animate-bounce" />
                <p className="text-[10px] font-black mt-1">豐生茶館</p>
                <div className="mt-2 text-[8px] opacity-50 font-bold">圈數: {laps}/5</div>
              </div>

              {/* Tiles */}
              {board.map((tile, idx) => {
                const pos = TILE_POSITIONS[idx];
                const isActive = currentTile === idx;
                return (
                  <div 
                    key={tile.id}
                    style={{ gridRow: pos.r, gridColumn: pos.c }}
                    className={`relative rounded-xl border-2 flex flex-col items-center justify-center p-1 transition-all ${
                      isActive ? 'bg-[#F27D26] border-[#8B4513] text-white z-10 scale-105 shadow-md' : 'bg-white border-[#8B4513]/20 text-[#8B4513]'
                    }`}
                  >
                    <div className="text-sm">{tile.icon}</div>
                    <span className="text-[7px] font-bold mt-1 text-center leading-tight">{tile.label}</span>
                    
                    {/* Player Avatar */}
                    {isActive && (
                      <motion.div 
                        layoutId="player"
                        className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white z-20"
                      >
                        <img src={userProfile?.pictureUrl} className="w-full h-full object-cover" alt="me" />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dice & Controls */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <motion.div 
                animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
                className="w-16 h-16 bg-white rounded-2xl border-4 border-[#8B4513] flex items-center justify-center shadow-lg"
              >
                <span className="text-3xl font-black text-[#8B4513]">{diceValue}</span>
              </motion.div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={rollDice}
                disabled={isRolling || !!eventModal || restSeconds > 0}
                className={`px-12 py-4 rounded-full font-black text-xl shadow-[0_6px_0_#8B4513] active:shadow-none active:translate-y-1 transition-all flex items-center gap-2 ${
                  isRolling || !!eventModal ? 'bg-gray-300 text-gray-500' : restSeconds > 0 ? 'bg-blue-400 text-white' : 'bg-[#F27D26] text-white'
                }`}
              >
                {restSeconds > 0 ? <Timer className="w-6 h-6" /> : <Dices className="w-6 h-6" />}
                {restSeconds > 0 ? `休息中 (${restSeconds}s)` : '擲骰子！'}
              </motion.button>
              
              <p className="text-[10px] font-bold opacity-40">總擲骰次數：{totalRolls}</p>
            </div>
          </>
        )}

        {gameState === 'finished' && (
          /* --- Result Stage --- */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center"
          >
            <div className="bg-white border-4 border-[#8B4513] rounded-3xl p-6 w-full shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#F27D26]" />
              
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <h2 className="text-xl font-black mb-1">任務達成！</h2>
              <p className="text-xs opacity-60 mb-4">收集美食成功，準備入座豐生茶館</p>
              
              <div className="bg-[#FDF5E6] p-4 rounded-2xl border-2 border-dashed border-[#8B4513]/30 mb-6">
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">獲得稱號</p>
                <p className={`text-xl font-black mt-1 ${getRank().color}`}>{getRank().title}</p>
                <div className="flex justify-center gap-2 mt-2">
                  {collectedFoods.map(i => (
                    <span key={i} className="text-lg">{FOOD_ITEMS[i].icon}</span>
                  ))}
                </div>
              </div>

              {/* Calculator */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6 text-left">
                <h3 className="text-xs font-black mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-[#F27D26]" /> 訂金計算機</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold">參加人數</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold">-</button>
                    <span className="font-black">{peopleCount}</span>
                    <button onClick={() => setPeopleCount(peopleCount + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold">+</button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-300">
                  <span className="text-xs font-bold">應付總額</span>
                  <span className="text-lg font-black text-[#F27D26]">$ {peopleCount * 100}</span>
                </div>
              </div>

              <div className="space-y-3 text-left border-t-2 border-[#8B4513]/10 pt-4">
                <h3 className="font-black text-[10px] flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> 聚餐核心資訊</h3>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 3/08 (日)</div>
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> 12:00</div>
                  <div className="flex items-center gap-1 col-span-2"><MapPin className="w-3 h-3" /> 豐生茶館 (梅川東路)</div>
                </div>
                <div className="p-2 bg-red-50 rounded border border-red-100 text-[9px] font-bold text-red-600">
                  ⚠️ 2/25 前繳交訂金，當天採各家庭式結帳。
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=豐生茶館+梅川東店" 
                  target="_blank" 
                  rel="noreferrer"
                  className="py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                >
                  <MapPin className="w-4 h-4 text-red-500" /> 前往豐生茶館 (Google Maps)
                </a>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleShare} className="py-3 bg-[#F27D26] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95">
                    <Share2 className="w-4 h-4" /> 分享戰績
                  </button>
                  <button onClick={() => setShowCertificate(true)} className="py-3 bg-[#8B4513] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95">
                    <CheckCircle2 className="w-4 h-4" /> 領取入座證
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-4 opacity-30 grayscale scale-75">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" className="h-6" alt="linepay" />
              <span className="text-xs font-bold">iPASS MONEY / 現金支援</span>
            </div>
          </motion.div>
        )}

        {/* Event Modal */}
        <AnimatePresence>
          {eventModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl border-4 border-[#8B4513] p-8 w-full max-w-xs text-center shadow-2xl"
              >
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  eventModal.type === 'good' ? 'bg-green-100 text-green-600' : 
                  eventModal.type === 'bad' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {eventModal.type === 'good' ? <Zap className="w-8 h-8" /> : 
                   eventModal.type === 'bad' ? <AlertCircle className="w-8 h-8" /> : <Info className="w-8 h-8" />}
                </div>
                <h3 className="text-lg font-black mb-2">{eventModal.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed mb-6">{eventModal.msg}</p>
                <button 
                  onClick={() => {
                    if (eventModal.action) eventModal.action();
                    setEventModal(null);
                  }}
                  className="w-full py-3 bg-[#8B4513] text-white rounded-xl font-bold active:scale-95"
                >
                  知道了！
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Certificate Overlay */}
        <AnimatePresence>
          {showCertificate && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
            >
              <motion.div 
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="bg-[#FDF5E6] rounded-3xl border-8 border-[#8B4513] p-6 w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
              >
                {/* Crack/Heart Decorations */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                  <div className="absolute top-10 left-10 text-4xl rotate-12">💔</div>
                  <div className="absolute bottom-20 right-5 text-5xl -rotate-12">💔</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[20px] border-dashed border-[#8B4513] rounded-full scale-150 opacity-20" />
                </div>

                <div className="text-center relative z-10">
                  <div className="inline-block px-4 py-1 bg-[#8B4513] text-white rounded-full text-[10px] font-black tracking-widest mb-4">
                    OFFICIAL PASS
                  </div>
                  <h2 className="text-xl font-black text-[#8B4513] mb-6 flex items-center justify-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-600" /> 專屬入座憑證
                  </h2>

                  <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-3">
                      <img src={userProfile?.pictureUrl} className="w-full h-full object-cover" alt="avatar" />
                    </div>
                    <p className="font-black text-lg">{userProfile?.displayName}</p>
                    <p className="text-xs opacity-50 font-bold">獲封：{getRank().title}</p>
                  </div>

                  <div className="bg-white/50 rounded-2xl p-4 border-2 border-[#8B4513]/20 mb-6 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-[#8B4513]" />
                      <span className="text-sm font-black">3/8 (日) 12:00</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#4A2C2A] font-medium italic">
                      吧拉拉導播真心話：為了防止有人放鴿子，請務必依參加人數繳納訂金。不然主辦方會玻璃心碎掉，碎到可能明天都不能上班了... 💔 (訂金 $100/人，2/25 截止)
                    </p>
                  </div>

                  <button 
                    onClick={handleShare}
                    className="w-full py-4 bg-[#F27D26] text-white rounded-2xl font-black text-lg shadow-[0_6px_0_#8B4513] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-6 h-6" /> 確認入座並分享回報
                  </button>
                  
                  <button 
                    onClick={() => setShowCertificate(false)}
                    className="mt-4 text-[10px] font-bold opacity-40 underline"
                  >
                    返回修改人數
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-md py-4 text-center text-[10px] opacity-30 mt-auto">
        © 2026 豐生茶館聚餐委員會 · 吧拉拉導播監製
      </footer>

      {/* Background Decorative Elements */}
      <div className="fixed top-10 -left-10 w-40 h-40 bg-[#F27D26]/5 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-10 -right-10 w-60 h-60 bg-[#8B4513]/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}
