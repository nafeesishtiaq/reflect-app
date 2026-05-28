import { useGoalStore } from "@/src/store/goalStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const ACCENT = "#FF6B35";
const RING_SIZE = 220;
const STROKE = 10;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TIME_OPTIONS: number[] = [];
for (let i = 1; i <= 24; i++) TIME_OPTIONS.push(i * 5);
const OTHERS = ["Study", "Work", "Other"];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Pomodoro() {
  const goals = useGoalStore((s) => s.goals);
  const freeSessions = useGoalStore((s) => s.freeSessions);
  const addFocusSession = useGoalStore((s) => s.addFocusSession);

  const activeGoals = goals.filter((g) => g.status === "active");

  const [durationMins, setDurationMins] = useState(25);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedOther, setSelectedOther] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [sessionCount, setSessionCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const lastSwitchTimeRef = useRef<Date | null>(null);
  const selectedGoalIdRef = useRef<string | null>(null);
  const selectedOtherRef = useRef<string | null>(null);
  const timerDoneRef = useRef(false);

  useEffect(() => {
    selectedGoalIdRef.current = selectedGoalId;
  }, [selectedGoalId]);
  useEffect(() => {
    selectedOtherRef.current = selectedOther;
  }, [selectedOther]);

  useEffect(() => {
    if (phase === "idle") setSecondsLeft(durationMins * 60);
  }, [durationMins]);

  useEffect(() => {
    if (secondsLeft === 0 && timerDoneRef.current) {
      timerDoneRef.current = false;
      Vibration.vibrate([0, 400, 200, 400]);
      const now = new Date();
      savePartialSession(now);
      lastSwitchTimeRef.current = now;
      setSessionCount((c) => c + 1);
      setPhase("done");
    }
  }, [secondsLeft]);

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function savePartialSession(endTime: Date) {
    const start = lastSwitchTimeRef.current ?? startTimeRef.current ?? endTime;
    const elapsed = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    const mins = Math.round(elapsed / 60);
    if (mins > 0) {
      addFocusSession({
        id: Date.now().toString(),
        date: start,
        duration: mins,
        goalId: selectedGoalIdRef.current ?? undefined,
        label: selectedGoalIdRef.current
          ? undefined
          : selectedOtherRef.current ?? undefined,
      });
    }
    return mins;
  }

  function startTimer() {
    const now = new Date();
    startTimeRef.current = now;
    lastSwitchTimeRef.current = now;
    timerDoneRef.current = false;
    setPhase("running");
    setSecondsLeft(durationMins * 60);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          timerDoneRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleStop() {
    Alert.alert("Are you sure you want to give up?", undefined, [
      { text: "Keep going", style: "cancel" },
      {
        text: "Give up",
        style: "destructive",
        onPress: () => {
          clearTimer();
          const now = new Date();
          const mins = savePartialSession(now);
          if (mins > 0) setSessionCount((c) => c + 1);
          setPhase("idle");
          setSecondsLeft(durationMins * 60);
        },
      },
    ]);
  }

  function handleReset() {
    clearTimer();
    setPhase("idle");
    setSecondsLeft(durationMins * 60);
    setSessionCount(0);
  }

  function handleGoalSwitch(newGoalId: string | null, newOther: string | null) {
    if (phase === "running") {
      const now = new Date();
      savePartialSession(now);
      lastSwitchTimeRef.current = now;
    }
    setSelectedGoalId(newGoalId);
    setSelectedOther(newOther);
    setPickerVisible(false);
  }

  const progress =
    phase === "running"
      ? 1 - secondsLeft / (durationMins * 60)
      : phase === "done"
      ? 1
      : 0;

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const isRunning = phase === "running";
  const selectedGoal = activeGoals.find((g) => g.id === selectedGoalId);
  const focusLabel = selectedGoal
    ? selectedGoal.title
    : selectedOther
    ? selectedOther
    : null;

  const allSessions = [
    ...goals.flatMap((g) =>
      (g.focusSessions ?? []).map((s) => ({
        ...s,
        displayLabel: g.title,
      }))
    ),
    ...freeSessions.map((s) => ({
      ...s,
      displayLabel: (s as any).label ?? "Other",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const totalTodayMins = allSessions
    .filter(
      (s) => new Date(s.date).toDateString() === new Date().toDateString()
    )
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Focus</Text>
          {totalTodayMins > 0 && (
            <View style={styles.todayBadge}>
              <Ionicons name="flame-outline" size={13} color={ACCENT} />
              <Text style={styles.todayText}>
                {formatDuration(totalTodayMins)} today
              </Text>
            </View>
          )}
        </View>

        {/* Timer ring */}
        <View style={styles.timerContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={styles.svg}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="#2A2A2A"
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={phase === "done" ? "#FFB347" : ACCENT}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.timerInner}>
            <Text style={styles.phaseLabel}>
              {phase === "idle"
                ? "READY"
                : phase === "running"
                ? "FOCUS"
                : "DONE"}
            </Text>
            <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
            {sessionCount > 0 && (
              <Text style={styles.sessionCount}>
                {sessionCount} session{sessionCount !== 1 ? "s" : ""} done
              </Text>
            )}
          </View>
        </View>

        {/* Settings pill */}
        <TouchableOpacity
          style={styles.settingsPill}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="options-outline" size={14} color="#555" />
          <Text style={styles.pillLabel} numberOfLines={1}>
            {focusLabel ?? "Set time and goal"}
          </Text>
          <View style={styles.pillDivider} />
          <Text style={styles.pillDuration}>{durationMins}m</Text>
        </TouchableOpacity>

        {/* Controls */}
        <View style={styles.controls}>
          {phase === "idle" || phase === "done" ? (
            <TouchableOpacity
              style={styles.startBtn}
              onPress={startTimer}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={22} color="#fff" />
              <Text style={styles.startBtnText}>
                {phase === "done" ? "Again" : "Start Focus"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopBtn}
              onPress={handleStop}
              activeOpacity={0.85}
            >
              <Ionicons name="stop" size={22} color="#fff" />
              <Text style={styles.startBtnText}>Stop</Text>
            </TouchableOpacity>
          )}
          {(phase === "done" || sessionCount > 0) && (
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={18} color="#555" />
            </TouchableOpacity>
          )}
        </View>

        {/* Session history */}
        {allSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            {allSessions.map((session) => (
              <View key={session.id} style={styles.sessionRow}>
                <View style={styles.sessionDot} />
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionGoal}>{session.displayLabel}</Text>
                  <Text style={styles.sessionDate}>
                    {formatDate(session.date)}
                  </Text>
                </View>
                <Text style={styles.sessionDuration}>
                  {formatDuration(session.duration)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Bottom sheet */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View
            style={styles.modalSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHandle} />

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Duration — hidden while running */}
              {!isRunning && (
                <>
                  <Text style={styles.modalSection}>Focus time</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timeList}
                    nestedScrollEnabled
                  >
                    {TIME_OPTIONS.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.timeChip,
                          durationMins === item && styles.timeChipActive,
                        ]}
                        onPress={() => setDurationMins(item)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.timeChipText,
                            durationMins === item && styles.timeChipTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text style={[styles.modalSection, { marginTop: 24 }]}>
                    Focus on
                  </Text>
                </>
              )}
              {isRunning && (
                <Text style={[styles.modalSection, { marginTop: 4 }]}>
                  Focus on
                </Text>
              )}

              {/* Goals */}
              {activeGoals.length > 0 && (
                <>
                  <Text style={styles.modalSub}>Goals</Text>
                  {activeGoals.map((goal) => (
                    <TouchableOpacity
                      key={goal.id}
                      style={[
                        styles.goalOption,
                        selectedGoalId === goal.id && styles.goalOptionActive,
                      ]}
                      onPress={() => handleGoalSwitch(goal.id, null)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name="flag-outline"
                        size={15}
                        color={selectedGoalId === goal.id ? ACCENT : "#FF8C55"}
                      />
                      <Text
                        style={[
                          styles.goalOptionText,
                          selectedGoalId === goal.id &&
                            styles.goalOptionTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {goal.title}
                      </Text>
                      {selectedGoalId === goal.id && (
                        <Ionicons
                          name="checkmark"
                          size={15}
                          color={ACCENT}
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Others */}
              <Text style={styles.modalSub}>Others</Text>
              {OTHERS.map((label) => {
                const isActive = selectedOther === label && !selectedGoalId;
                const idleColor =
                  label === "Study"
                    ? "#5B8DD9"
                    : label === "Work"
                    ? "#A78BFA"
                    : "#6EE7B7";
                return (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.goalOption,
                      isActive && styles.goalOptionActive,
                    ]}
                    onPress={() => handleGoalSwitch(null, label)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={
                        label === "Study"
                          ? "book-outline"
                          : label === "Work"
                          ? "briefcase-outline"
                          : "ellipsis-horizontal-circle-outline"
                      }
                      size={15}
                      color={isActive ? ACCENT : idleColor}
                    />
                    <Text
                      style={[
                        styles.goalOptionText,
                        isActive && styles.goalOptionTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                    {isActive && (
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color={ACCENT}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}

              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111111" },
  scroll: { paddingHorizontal: 20, paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  todayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  todayText: { fontSize: 13, color: "#888", fontWeight: "500" },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  svg: { position: "absolute" },
  timerInner: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#444",
    letterSpacing: 2,
    marginBottom: 6,
  },
  timerText: {
    fontSize: 52,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -2,
  },
  sessionCount: {
    fontSize: 11,
    color: "#555",
    marginTop: 6,
  },
  settingsPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 28,
  },
  pillLabel: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  pillDivider: {
    width: 1,
    height: 14,
    backgroundColor: "#2A2A2A",
  },
  pillDuration: {
    fontSize: 13,
    color: ACCENT,
    fontWeight: "700",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 40,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 36,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  stopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#2A2A2A",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 36,
  },
  startBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  resetBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
    flexShrink: 0,
  },
  sessionInfo: { flex: 1 },
  sessionGoal: { color: "#fff", fontSize: 13, fontWeight: "500" },
  sessionDate: { color: "#555", fontSize: 11, marginTop: 2 },
  sessionDuration: { color: ACCENT, fontSize: 13, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#333",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalSection: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  modalSub: {
    fontSize: 11,
    color: "#444",
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
  timeList: {
    gap: 8,
    paddingBottom: 4,
    paddingHorizontal: 4,
  },
  timeChip: {
    width: 52,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  timeChipActive: {
    backgroundColor: "#1E1E1E",
    borderColor: ACCENT,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  timeChipTextActive: { color: ACCENT },
  goalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2E2E2E",
  },
  goalOptionActive: {
    borderColor: ACCENT,
    backgroundColor: "#2A1A10",
  },
  goalOptionText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
    flex: 1,
  },
  goalOptionTextActive: { color: "#fff" },
});
