import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../motion/effects.dart';
import '../theme/colors.dart';
import '../theme/spacing.dart';
import '../widgets/primary_button.dart';
import '../widgets/secondary_button.dart';
import 'copy.dart';
import 'illustration.dart';

class Screen1Welcome extends ConsumerWidget {
  const Screen1Welcome({
    super.key,
    required this.onContinue,
    required this.onSkip,
    required this.pageOffset,
    required this.reduceMotion,
  });

  final VoidCallback onContinue;
  final VoidCallback onSkip;
  final double pageOffset;
  final bool reduceMotion;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final parallaxText = pageOffset * -32 * 0.25;
    final parallaxImage = pageOffset * -40 * 0.15;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppSpacing.lg),
                animateTitle(
                  Transform.translate(
                    offset: Offset(0, parallaxText),
                    child: Text(
                      OB['s1_title']!,
                      style: Theme.of(context)
                          .textTheme
                          .displayMedium
                          ?.copyWith(color: AppColors.textPrimary, fontWeight: FontWeight.w700),
                    ),
                  ),
                  reduceMotion: reduceMotion,
                ),
                const SizedBox(height: AppSpacing.md),
                animateSubtitle(
                  Transform.translate(
                    offset: Offset(0, parallaxText * 0.7),
                    child: Text(
                      OB['s1_sub']!,
                      style: Theme.of(context)
                          .textTheme
                          .bodyLarge
                          ?.copyWith(color: AppColors.textSecondary, height: 1.5),
                    ),
                  ),
                  reduceMotion: reduceMotion,
                ),
                const SizedBox(height: AppSpacing.xl),
                Expanded(
                  child: animateIllustration(
                    Transform.translate(
                      offset: Offset(parallaxImage, 0),
                      child: OnboardingIllustration(
                        asset: 'assets/illustration/ob1.png',
                        reduceMotion: reduceMotion,
                      ),
                    ),
                    reduceMotion: reduceMotion,
                  ),
                ),
              ],
            ),
          ),
          animateCta(
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                PrimaryButton(
                  label: OB['s1_cta']!,
                  onPressed: onContinue,
                  semanticLabel: 'Continue onboarding',
                ),
                const SizedBox(height: AppSpacing.sm),
                SecondaryButton(
                  label: OB['s1_skip']!,
                  onPressed: onSkip,
                  semanticLabel: 'Skip onboarding setup',
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
