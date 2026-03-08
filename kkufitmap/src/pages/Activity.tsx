import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonModal, useIonViewWillEnter } from '@ionic/react';
import React, { useState } from 'react';
import { Plus, Clock, Calendar, Dumbbell, Bike, Footprints, X, Check, MapPin, Activity as ActivityIcon, Trash2 } from 'lucide-react';
import { useHistory } from 'react-router-dom'; 
import './Home.css';

interface ActivityRecord {
  id: string;
  type: 'walk' | 'run' | 'gym' | 'bike';
  date: string;
  durationMinutes: number;
  locationName: string;
}

interface Place {
  id: string;
  name: string;
}

const Activity: React.FC = () => {
  const history = useHistory(); 
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(''); 

  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [selectedType, setSelectedType] = useState<'walk' | 'run' | 'gym' | 'bike'>('run');
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hoursInput, setHoursInput] = useState<string>('');
  const [minutesInput, setMinutesInput] = useState<string>(''); 
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  useIonViewWillEnter(() => {
    const email = localStorage.getItem('current_user_email');
    if (!email) {
      history.push('/welcome');
      return;
    }
    setCurrentUserEmail(email);

    const loadedActivities = JSON.parse(localStorage.getItem(`user_activities_${email}`) || '[]');
    setActivities(loadedActivities);

    const saved = JSON.parse(localStorage.getItem(`saved_places_${email}`) || '[]');
    setSavedPlaces(saved);
  });

  const totalMinutes = activities.reduce((sum, act) => sum + act.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  const uniqueDays = new Set(activities.map(act => act.date)).size;

  // 🌟 ลอจิกใหม่: อิงจาก จำนวนครั้ง -> เวลา -> ถ้าเท่ากันให้โชว์คู่ 🌟
  const getActivityStats = () => {
    if (activities.length === 0) return 'ยังไม่มี';

    // 1. เก็บข้อมูลทั้งจำนวนครั้งและเวลารวม
    const stats: Record<string, { count: number, duration: number }> = {
      walk: { count: 0, duration: 0 },
      run: { count: 0, duration: 0 },
      gym: { count: 0, duration: 0 },
      bike: { count: 0, duration: 0 }
    };

    activities.forEach(act => {
      if (stats[act.type]) {
        stats[act.type].count += 1;
        stats[act.type].duration += act.durationMinutes;
      }
    });

    // กรองเอาเฉพาะกิจกรรมที่เคยทำ
    const activeStats = Object.entries(stats).filter(([_, data]) => data.count > 0);
    if (activeStats.length === 0) return 'ยังไม่มี';

    // 2. เรียงลำดับ: เช็คจำนวนครั้งก่อน ถ้าจำนวนครั้งเท่ากันให้เช็คเวลา
    activeStats.sort((a, b) => {
      if (b[1].count !== a[1].count) {
        return b[1].count - a[1].count; // เรียงตามจำนวนครั้ง (มากไปน้อย)
      }
      return b[1].duration - a[1].duration; // ถ้าครั้งเท่ากัน เรียงตามเวลา (มากไปน้อย)
    });

    // 3. หาสถิติอันดับ 1
    const topCount = activeStats[0][1].count;
    const topDuration = activeStats[0][1].duration;

    // 4. เช็คว่ามีกิจกรรมอื่นที่ "ตีเสมอ" (Tie) กับอันดับ 1 หรือไม่ (ครั้งเท่ากัน และเวลาเท่ากันเป๊ะ)
    const tiedActivities = activeStats.filter(
      item => item[1].count === topCount && item[1].duration === topDuration
    );

    const typeMap: Record<string, string> = { walk: 'เดิน', run: 'วิ่ง', gym: 'ฟิตเนส', bike: 'ปั่นจักรยาน' };
    
    // 5. นำชื่อมาต่อกัน ถ้ามีอันเดียวก็โชว์อันเดียว ถ้ามี 2 อันจะคั่นด้วย " / "
    return tiedActivities.map(item => typeMap[item[0]]).join(' / ');
  };

  const openAddModal = () => {
    setEditingId(null);
    setSelectedType('run');
    setDateInput(new Date().toISOString().split('T')[0]);
    setHoursInput('');
    setMinutesInput('');
    setSelectedLocation(savedPlaces.length > 0 ? savedPlaces[0].name : '');
    setIsModalOpen(true);
  };

  const openEditModal = (act: ActivityRecord) => {
    setEditingId(act.id);
    setSelectedType(act.type);
    setDateInput(act.date);
    
    const h = Math.floor(act.durationMinutes / 60);
    const m = act.durationMinutes % 60;
    
    setHoursInput(h > 0 ? h.toString() : '');
    setMinutesInput(m > 0 ? m.toString() : '');
    setSelectedLocation(act.locationName);
    
    setIsModalOpen(true);
  };

  const handleSaveActivity = () => {
    const hrs = parseInt(hoursInput) || 0;
    const mins = parseInt(minutesInput) || 0;
    const totalMins = (hrs * 60) + mins;

    if (totalMins === 0) {
      alert("กรุณาระบุระยะเวลาออกกำลังกาย");
      return;
    }

    const newActivityData: ActivityRecord = {
      id: editingId || Date.now().toString(), 
      type: selectedType,
      date: dateInput,
      durationMinutes: totalMins,
      locationName: selectedLocation || 'ไม่ได้ระบุสถานที่'
    };

    let updatedActivities;
    if (editingId) {
      updatedActivities = activities.map(act => act.id === editingId ? newActivityData : act);
    } else {
      updatedActivities = [newActivityData, ...activities];
    }

    // เรียงให้กิจกรรมล่าสุดอยู่บนสุดเสมอ
    updatedActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setActivities(updatedActivities);
    localStorage.setItem(`user_activities_${currentUserEmail}`, JSON.stringify(updatedActivities));
    setIsModalOpen(false);
  };

  const handleDeleteActivity = () => {
    if (window.confirm("คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?")) {
      const updatedActivities = activities.filter(act => act.id !== editingId);
      setActivities(updatedActivities);
      localStorage.setItem(`user_activities_${currentUserEmail}`, JSON.stringify(updatedActivities));
      setIsModalOpen(false);
    }
  };

  const formatDateThai = (dateString: string) => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const date = new Date(dateString);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
  };

  const formatDurationDisplay = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h > 0 && m > 0) return `${h} ชม. ${m} น.`;
    if (h > 0) return `${h} ชม.`;
    return `${m} นาที`;
  };

  const activityTypes = [
    { id: 'walk', label: 'เดิน', icon: <Footprints size={24} />, color: '#f1f5f9', iconColor: '#64748b' },
    { id: 'run', label: 'วิ่ง', icon: <ActivityIcon size={24} />, color: '#dcfce7', iconColor: '#10b981' },
    { id: 'gym', label: 'ฟิตเนส', icon: <Dumbbell size={24} />, color: '#f1f5f9', iconColor: '#64748b' },
    { id: 'bike', label: 'ปั่นจักรยาน', icon: <Bike size={24} />, color: '#eff6ff', iconColor: '#3b82f6' }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#10b981' }}>
          <IonTitle style={{ color: 'white', fontWeight: 'bold' }}>สถิติและกิจกรรม</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f8fafc' }}>
        <div className="main-content" style={{ marginTop: '20px', paddingBottom: '40px' }}>
          
          <div className="activity-header-row">
            <h1 className="activity-page-title">บันทึกการออกกำลังกาย</h1>
            <button className="add-activity-btn" onClick={openAddModal}>
              <Plus size={24} />
            </button>
          </div>

          <div className="stat-summary-card">
            <div className="stat-item">
              <div className="stat-icon-wrapper" style={{ color: '#3b82f6' }}><Clock size={18} /></div>
              <h3 className="stat-value">
                {totalHours} <span className="stat-unit">ชม.</span> {remainingMinutes > 0 ? `${remainingMinutes} ` : ''}{remainingMinutes > 0 && <span className="stat-unit">น.</span>}
              </h3>
              <p className="stat-label">เวลาทั้งหมด</p>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon-wrapper" style={{ color: '#f97316' }}><Calendar size={18} /></div>
              <h3 className="stat-value">{uniqueDays} <span className="stat-unit">วัน</span></h3>
              <p className="stat-label">จำนวนวัน</p>
            </div>

            <div className="stat-item">
              <div className="stat-icon-wrapper" style={{ color: '#10b981' }}><Dumbbell size={18} /></div>
              {/* 🌟 แสดงผลลัพธ์ที่ฉลาดขึ้นตรงนี้ */}
              <h3 className="stat-value" style={{ fontSize: getActivityStats().includes('/') ? '16px' : '22px' }}>
                {getActivityStats()}
              </h3>
              <p className="stat-label">กิจกรรมบ่อยสุด</p>
            </div>
          </div>

          <div>
            <h2 className="history-section-title">ประวัติการออกกำลังกาย</h2>
            <p style={{fontSize: '13px', color: '#94a3b8', marginTop: '-10px', marginBottom: '15px'}}>*แตะที่ประวัติเพื่อแก้ไขหรือลบ</p>
            
            {activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                <ActivityIcon size={48} style={{ opacity: 0.3, margin: '0 auto 10px auto' }} />
                <p>ยังไม่มีประวัติการออกกำลังกาย<br/>กดปุ่ม + เพื่อบันทึกเลย!</p>
              </div>
            ) : (
              activities.map((act) => {
                const typeData = activityTypes.find(t => t.id === act.type) || activityTypes[0];
                return (
                  <div key={act.id} className="history-card" onClick={() => openEditModal(act)}>
                    <div className="history-icon-bg" style={{ backgroundColor: typeData.id === 'run' ? '#dcfce7' : typeData.id === 'bike' ? '#eff6ff' : typeData.id === 'gym' ? '#fef3c7' : '#f1f5f9' }}>
                      <span style={{ color: typeData.id === 'run' ? '#10b981' : typeData.id === 'bike' ? '#3b82f6' : typeData.id === 'gym' ? '#d97706' : '#64748b' }}>
                        {typeData.icon}
                      </span>
                      {act.type === 'run' && <div className="history-dot"></div>}
                    </div>
                    
                    <div className="history-details">
                      <h3 className="history-title">{act.locationName}</h3>
                      <p className="history-date">{formatDateThai(act.date)}</p>
                    </div>

                    <div className="history-duration-badge">
                      {formatDurationDisplay(act.durationMinutes)}
                    </div>
                  </div>
                )
              })
            )}
          </div>

        </div>

        {/* ================= MODAL บันทึกกิจกรรม ================= */}
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)} className="activity-modal">
          <IonContent>
            <div className="modal-form-container">
              
              <div className="modal-header-simple">
                <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                  <X size={28} />
                </button>
                <h2 className="modal-title-simple">{editingId ? 'แก้ไขกิจกรรม' : 'บันทึกกิจกรรม'}</h2>
              </div>

              <div className="form-group">
                <label className="form-label">ประเภทกิจกรรม</label>
                <div className="activity-type-grid">
                  {activityTypes.map((type) => (
                    <div 
                      key={type.id} 
                      className={`type-btn ${selectedType === type.id ? 'active' : ''}`}
                      onClick={() => setSelectedType(type.id as any)}
                    >
                      {selectedType === type.id && <div className="active-dot"></div>}
                      <div className="type-icon-circle">
                        {type.icon}
                      </div>
                      <span className="type-name">{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">วันที่ออกกำลังกาย</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="date" 
                    className="custom-input" 
                    style={{ paddingLeft: '48px' }}
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ระยะเวลา</label>
                <div className="duration-grid">
                  <div className="duration-input-wrapper">
                    <input 
                      type="number" 
                      className="custom-input" 
                      placeholder="0"
                      value={hoursInput}
                      onChange={(e) => setHoursInput(e.target.value)}
                    />
                    <span className="duration-unit">ชั่วโมง</span>
                  </div>
                  <div className="duration-input-wrapper">
                    <input 
                      type="number" 
                      className="custom-input" 
                      placeholder="0"
                      value={minutesInput}
                      onChange={(e) => setMinutesInput(e.target.value)}
                    />
                    <span className="duration-unit">นาที</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">สถานที่</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={20} color="#10b981" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select 
                    className="custom-input" 
                    style={{ paddingLeft: '48px', appearance: 'none' }}
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="" disabled>เลือกสถานที่ที่บันทึกไว้</option>
                    {savedPlaces.length === 0 ? (
                      <option value="อื่นๆ">สถานที่อื่นๆ (ยังไม่มีที่บันทึกไว้)</option>
                    ) : (
                      savedPlaces.map(place => (
                        <option key={place.id} value={place.name}>{place.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <button className="save-activity-btn" onClick={handleSaveActivity}>
                <Check size={24} />
                {editingId ? 'บันทึกการแก้ไข' : 'บันทึกการออกกำลังกาย'}
              </button>

              {editingId && (
                <button className="delete-activity-btn" onClick={handleDeleteActivity}>
                  <Trash2 size={20} />
                  ลบกิจกรรมนี้
                </button>
              )}

            </div>
          </IonContent>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default Activity;