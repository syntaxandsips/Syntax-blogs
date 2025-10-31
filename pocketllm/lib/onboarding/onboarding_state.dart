import 'dart:async';
import 'dart:convert';

import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../motion/tokens.dart';

const _prefsKey = 'pocketllm_onboarding_v1';

class OnboardingModel {
  const OnboardingModel({
    required this.completed,
    required this.providerKeys,
    required this.smartRouting,
    required this.toolUse,
    required this.memory,
    required this.localHistoryOnly,
    required this.analytics,
    required this.localVectorCache,
  });

  factory OnboardingModel.initial() => const OnboardingModel(
        completed: false,
        providerKeys: {},
        smartRouting: true,
        toolUse: true,
        memory: true,
        localHistoryOnly: true,
        analytics: false,
        localVectorCache: true,
      );

  final bool completed;
  final Map<String, String> providerKeys;
  final bool smartRouting;
  final bool toolUse;
  final bool memory;
  final bool localHistoryOnly;
  final bool analytics;
  final bool localVectorCache;

  OnboardingModel copyWith({
    bool? completed,
    Map<String, String>? providerKeys,
    bool? smartRouting,
    bool? toolUse,
    bool? memory,
    bool? localHistoryOnly,
    bool? analytics,
    bool? localVectorCache,
  }) {
    return OnboardingModel(
      completed: completed ?? this.completed,
      providerKeys: providerKeys ?? this.providerKeys,
      smartRouting: smartRouting ?? this.smartRouting,
      toolUse: toolUse ?? this.toolUse,
      memory: memory ?? this.memory,
      localHistoryOnly: localHistoryOnly ?? this.localHistoryOnly,
      analytics: analytics ?? this.analytics,
      localVectorCache: localVectorCache ?? this.localVectorCache,
    );
  }

  Map<String, dynamic> toJson() => {
        'completed': completed,
        'providerKeys': providerKeys,
        'smartRouting': smartRouting,
        'toolUse': toolUse,
        'memory': memory,
        'localHistoryOnly': localHistoryOnly,
        'analytics': analytics,
        'localVectorCache': localVectorCache,
      };

  factory OnboardingModel.fromJson(Map<String, dynamic> json) {
    return OnboardingModel(
      completed: json['completed'] as bool? ?? false,
      providerKeys: (json['providerKeys'] as Map?)
              ?.map((key, value) => MapEntry(key.toString(), value.toString())) ??
          const {},
      smartRouting: json['smartRouting'] as bool? ?? true,
      toolUse: json['toolUse'] as bool? ?? true,
      memory: json['memory'] as bool? ?? true,
      localHistoryOnly: json['localHistoryOnly'] as bool? ?? true,
      analytics: json['analytics'] as bool? ?? false,
      localVectorCache: json['localVectorCache'] as bool? ?? true,
    );
  }
}

class OnboardingNotifier extends StateNotifier<OnboardingModel> {
  OnboardingNotifier() : super(OnboardingModel.initial()) {
    _initCompleter = Completer<void>();
    _hydrate();
  }

  late final Completer<void> _initCompleter;
  bool _initialized = false;
  Timer? _saveDebounce;

  bool get isInitialized => _initialized;

  Future<void> ensureInitialized() => _initCompleter.future;

  Future<void> _hydrate() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_prefsKey);
    if (raw != null) {
      try {
        final jsonMap = json.decode(raw) as Map<String, dynamic>;
        state = OnboardingModel.fromJson(jsonMap);
      } catch (_) {
        state = OnboardingModel.initial();
      }
    }
    _initialized = true;
    if (!_initCompleter.isCompleted) {
      _initCompleter.complete();
    }
  }

  void markCompleted() {
    state = state.copyWith(completed: true);
    _queueSave();
  }

  void updateProviderKey(String provider, String key) {
    final updated = Map<String, String>.from(state.providerKeys);
    if (key.isEmpty) {
      updated.remove(provider);
    } else {
      updated[provider] = key;
    }
    state = state.copyWith(providerKeys: updated);
    _queueSave();
  }

  void setRouting(bool smart, bool tool, bool memory) {
    state = state.copyWith(smartRouting: smart, toolUse: tool, memory: memory);
    _queueSave();
  }

  void setPrivacy({
    bool? localHistoryOnly,
    bool? analytics,
    bool? localVectorCache,
  }) {
    state = state.copyWith(
      localHistoryOnly: localHistoryOnly ?? state.localHistoryOnly,
      analytics: analytics ?? state.analytics,
      localVectorCache: localVectorCache ?? state.localVectorCache,
    );
    _queueSave();
  }

  void resetCompletion() {
    state = state.copyWith(completed: false);
    _queueSave();
  }

  void _queueSave() {
    _saveDebounce?.cancel();
    _saveDebounce = Timer(MotionDurations.debounce, _persist);
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, json.encode(state.toJson()));
  }

  @override
  void dispose() {
    _saveDebounce?.cancel();
    super.dispose();
  }
}

final onboardingStateProvider = StateNotifierProvider<OnboardingNotifier, OnboardingModel>((ref) {
  return OnboardingNotifier();
});

final onboardingInitializedProvider = Provider<bool>((ref) {
  return ref.watch(onboardingStateProvider.notifier).isInitialized;
});

final onboardingReadyProvider = FutureProvider<void>((ref) async {
  await ref.read(onboardingStateProvider.notifier).ensureInitialized();
});
