import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../motion/effects.dart';
import '../theme/colors.dart';
import '../theme/spacing.dart';
import '../widgets/checkbox_row.dart';
import '../widgets/primary_button.dart';
import 'copy.dart';
import 'illustration.dart';
import 'onboarding_state.dart';

class Screen4Privacy extends HookConsumerWidget {
  const Screen4Privacy({
    super.key,
    required this.onContinue,
    required this.reduceMotion,
  });

  final VoidCallback onContinue;
  final bool reduceMotion;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final model = ref.watch(onboardingStateProvider);
    final notifier = ref.read(onboardingStateProvider.notifier);
    final labels = useMemoized(() => OB['s4_checks']!.split(','), const []);

    void update(int index, bool value) {
      switch (index) {
        case 0:
          notifier.setPrivacy(localHistoryOnly: value);
          break;
        case 1:
          notifier.setPrivacy(analytics: value);
          break;
        case 2:
          notifier.setPrivacy(localVectorCache: value);
          break;
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          animateTitle(
            Text(
              OB['s4_title']!,
              style: Theme.of(context)
                  .textTheme
                  .headlineMedium
                  ?.copyWith(color: AppColors.textPrimary, fontWeight: FontWeight.w700),
            ),
            reduceMotion: reduceMotion,
          ),
          const SizedBox(height: AppSpacing.md),
          animateSubtitle(
            Text(
              OB['s4_sub']!,
              style: Theme.of(context)
                  .textTheme
                  .bodyLarge
                  ?.copyWith(color: AppColors.textSecondary, height: 1.5),
            ),
            reduceMotion: reduceMotion,
          ),
          const SizedBox(height: AppSpacing.lg),
          Expanded(
            child: animateIllustration(
              OnboardingIllustration(
                asset: 'assets/illustration/ob4.gif',
                reduceMotion: reduceMotion,
              ),
              reduceMotion: reduceMotion,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          for (var i = 0; i < labels.length; i++)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: animateCheckbox(
                CheckboxRow(
                  title: labels[i],
                  value: i == 0
                      ? model.localHistoryOnly
                      : i == 1
                          ? model.analytics
                          : model.localVectorCache,
                  onChanged: (value) => update(i, value),
                  reduceMotion: reduceMotion,
                ),
                delay: Duration(milliseconds: 80 * i),
                reduceMotion: reduceMotion,
              ),
            ),
          const SizedBox(height: AppSpacing.md),
          animateCta(
            PrimaryButton(
              label: OB['s4_cta']!,
              onPressed: onContinue,
            ),
            reduceMotion: reduceMotion,
          ),
        ],
      ),
    );
  }
}
