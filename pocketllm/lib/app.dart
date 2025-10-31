import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import 'onboarding/onboarding_state.dart';
import 'onboarding/precache.dart';
import 'router.dart';
import 'theme/colors.dart';
import 'theme/theme.dart';

class PocketLLMApp extends HookConsumerWidget {
  const PocketLLMApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final onboardingReady = ref.watch(onboardingReadyProvider);
    final precached = useState(false);

    useEffect(() {
      var disposed = false;
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        await precacheIllustrations(context);
        if (!disposed && context.mounted) {
          precached.value = true;
        }
      });
      return () => disposed = true;
    }, const []);

    final onboardingLoaded = onboardingReady.maybeWhen(
      data: (_) => true,
      error: (_, __) => true,
      orElse: () => false,
    );
    final ready = onboardingLoaded && precached.value;

    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.create(),
      routerConfig: router,
      builder: (context, child) {
        if (!ready) {
          return Scaffold(
            backgroundColor: AppColors.background,
            body: const Center(
              child: CircularProgressIndicator(),
            ),
          );
        }
        return child ?? const SizedBox.shrink();
      },
    );
  }
}
