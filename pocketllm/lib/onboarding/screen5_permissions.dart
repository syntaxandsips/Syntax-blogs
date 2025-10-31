import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../motion/effects.dart';
import '../motion/tokens.dart';
import '../theme/colors.dart';
import '../theme/spacing.dart';
import '../widgets/primary_button.dart';
import '../widgets/secondary_button.dart';
import 'copy.dart';
import 'illustration.dart';

class Screen5Permissions extends HookConsumerWidget {
  const Screen5Permissions({
    super.key,
    required this.onEnable,
    required this.onSkip,
    required this.reduceMotion,
  });

  final Future<void> Function() onEnable;
  final VoidCallback onSkip;
  final bool reduceMotion;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoading = useState(false);
    final shakeTrigger = useState(0);

    Future<void> handleEnable() async {
      isLoading.value = true;
      await onEnable();
      isLoading.value = false;
    }

    void handleSkip() {
      shakeTrigger.value++;
      onSkip();
    }

    final button = PrimaryButton(
      label: OB['s5_cta']!,
      onPressed: isLoading.value ? null : handleEnable,
      isLoading: isLoading.value,
    );

    final shouldShake = shakeTrigger.value > 0;
    final animatedButton = reduceMotion || !shouldShake
        ? button
        : Animate(
            key: ValueKey(shakeTrigger.value),
            effects: const [
              ShakeEffect(
                duration: Duration(milliseconds: 400),
                hz: 4,
                offset: Offset(8, 0),
              ),
            ],
            child: button,
          );

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          animateTitle(
            Text(
              OB['s5_title']!,
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
              OB['s5_sub']!,
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
                asset: 'assets/illustration/ob5.gif',
                reduceMotion: reduceMotion,
              ),
              reduceMotion: reduceMotion,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          AnimatedOpacity(
            duration: MotionDurations.medium,
            opacity: isLoading.value ? 1 : 0,
            child: isLoading.value
                ? Container(
                    height: 8,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      gradient: LinearGradient(
                        colors: [
                          AppColors.primary.withOpacity(0.2),
                          AppColors.primary,
                          AppColors.primary.withOpacity(0.2),
                        ],
                      ),
                    ),
                  ).animate(onPlay: (controller) => controller.repeat()).shimmer(duration: const Duration(milliseconds: 1200))
                : const SizedBox(height: 8),
          ),
          const SizedBox(height: AppSpacing.md),
          animateCta(
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                animatedButton,
                const SizedBox(height: AppSpacing.sm),
                SecondaryButton(
                  label: OB['s5_skip']!,
                  onPressed: handleSkip,
                ),
              ],
            ),
            reduceMotion: reduceMotion,
          ),
        ],
      ),
    );
  }
}
