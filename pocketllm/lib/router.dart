import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import 'onboarding/onboarding_pager.dart';
import 'onboarding/onboarding_state.dart';
import 'theme/colors.dart';
import 'theme/spacing.dart';
import 'widgets/primary_button.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(onboardingStateProvider.notifier);
  final onboarding = ref.watch(onboardingStateProvider);

  return GoRouter(
    debugLogDiagnostics: false,
    initialLocation: '/onboarding',
    routes: [
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => OnboardingPager(
          onFinished: () => context.go('/home'),
        ),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
    ],
    redirect: (context, state) {
      if (!notifier.isInitialized) {
        return null;
      }
      final completed = onboarding.completed;
      final isOnboarding = state.subloc.startsWith('/onboarding');
      if (!completed && !isOnboarding) {
        return '/onboarding';
      }
      if (completed && isOnboarding) {
        return '/home';
      }
      return null;
    },
  );
});

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'PocketLLM',
                  style: Theme.of(context)
                      .textTheme
                      .displayMedium
                      ?.copyWith(color: AppColors.textPrimary, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: AppSpacing.lg),
                Hero(
                  tag: 'primary_cta',
                  child: PrimaryButton(
                    label: 'Start chatting',
                    onPressed: () {},
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
