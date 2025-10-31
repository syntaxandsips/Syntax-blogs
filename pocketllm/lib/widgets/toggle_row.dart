import 'package:flutter/material.dart';

import '../motion/tokens.dart';
import '../theme/colors.dart';
import '../theme/spacing.dart';

class ToggleRow extends StatelessWidget {
  const ToggleRow({
    super.key,
    required this.title,
    required this.value,
    required this.onChanged,
    this.reduceMotion = false,
  });

  final String title;
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool reduceMotion;

  @override
  Widget build(BuildContext context) {
    final duration = reduceMotion ? const Duration(milliseconds: 120) : MotionDurations.medium;

    return Semantics(
      toggled: value,
      button: false,
      container: true,
      label: title,
      child: AnimatedContainer(
        duration: duration,
        curve: MotionCurves.easeOut,
        decoration: BoxDecoration(
          color: value ? AppColors.surface : AppColors.background,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: value ? AppColors.primary.withOpacity(0.6) : AppColors.stroke),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(value ? 0.3 : 0.18),
              blurRadius: value ? 20 : 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        child: Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ),
            Semantics(
              toggled: value,
              child: Switch(
                value: value,
                onChanged: onChanged,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
