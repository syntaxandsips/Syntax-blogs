import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../motion/effects.dart';
import '../theme/colors.dart';
import '../theme/spacing.dart';
import '../widgets/primary_button.dart';
import '../widgets/secondary_button.dart';
import 'copy.dart';
import 'illustration.dart';

class Screen6Done extends HookConsumerWidget {
  const Screen6Done({
    super.key,
    required this.onStart,
    required this.onImport,
    required this.reduceMotion,
  });

  final VoidCallback onStart;
  final VoidCallback onImport;
  final bool reduceMotion;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final freeze = useState(reduceMotion);

    useEffect(() {
      if (reduceMotion) return null;
      final timer = Timer(const Duration(seconds: 4), () => freeze.value = true);
      return timer.cancel;
    }, [reduceMotion]);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          animateTitle(
            Text(
              OB['s6_title']!,
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
              OB['s6_sub']!,
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
                asset: 'assets/illustration/ob6.gif',
                reduceMotion: freeze.value,
              ),
              reduceMotion: reduceMotion,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          animateCta(
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Hero(
                  tag: 'primary_cta',
                  child: PrimaryButton(
                    label: OB['s6_cta']!,
                    onPressed: onStart,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                SecondaryButton(
                  label: OB['s6_alt']!,
                  onPressed: onImport,
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
