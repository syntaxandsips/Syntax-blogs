import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../motion/effects.dart';
import '../theme/colors.dart';
import '../theme/spacing.dart';
import '../widgets/primary_button.dart';
import '../widgets/provider_chip.dart';
import '../widgets/secondary_button.dart';
import '../providers/connect_sheet.dart';
import 'copy.dart';
import 'illustration.dart';
import 'onboarding_state.dart';

class Screen2Providers extends HookConsumerWidget {
  const Screen2Providers({
    super.key,
    required this.onLater,
    required this.reduceMotion,
  });

  final VoidCallback onLater;
  final bool reduceMotion;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final providerLabels = useMemoized(() => OB['s2_chips']!.split(','), const []);
    final highlight = useState<String?>(null);
    final model = ref.watch(onboardingStateProvider);
    final notifier = ref.read(onboardingStateProvider.notifier);

    Future<void> connect(String label) async {
      final id = _providerId(label);
      final key = await showConnectSheet(
        context,
        provider: label,
        existingKey: model.providerKeys[id],
        reduceMotion: reduceMotion,
      );
      if (key != null) {
        notifier.updateProviderKey(id, key);
        highlight.value = id;
        await Future<void>.delayed(const Duration(milliseconds: 1200));
        if (highlight.value == id) {
          highlight.value = null;
        }
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          animateTitle(
            Text(
              OB['s2_title']!,
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
              OB['s2_sub']!,
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
                asset: 'assets/illustration/ob2.png',
                reduceMotion: reduceMotion,
              ),
              reduceMotion: reduceMotion,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              for (var i = 0; i < providerLabels.length; i++)
                animateChip(
                  ProviderChip(
                    label: providerLabels[i],
                    selected: model.providerKeys.containsKey(_providerId(providerLabels[i])),
                    onTap: () => connect(providerLabels[i]),
                    highlight: highlight.value == _providerId(providerLabels[i]),
                    reduceMotion: reduceMotion,
                  ),
                  delay: Duration(milliseconds: 60 * i),
                  reduceMotion: reduceMotion,
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          animateCta(
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                PrimaryButton(
                  label: OB['s2_cta']!,
                  onPressed: () => connect(providerLabels.first),
                  semanticLabel: 'Connect providers',
                ),
                const SizedBox(height: AppSpacing.sm),
                SecondaryButton(
                  label: OB['s2_later']!,
                  onPressed: onLater,
                ),
              ],
            ),
            reduceMotion: reduceMotion,
          ),
        ],
      ),
    );
  }

  String _providerId(String label) =>
      label.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '_').replaceAll(RegExp('_+'), '_');
}
