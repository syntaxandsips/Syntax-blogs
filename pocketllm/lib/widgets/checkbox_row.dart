import 'package:flutter/material.dart';

import '../motion/tokens.dart';
import '../theme/colors.dart';
import '../theme/spacing.dart';

class CheckboxRow extends StatelessWidget {
  const CheckboxRow({
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

    return GestureDetector(
      onTap: () => onChanged(!value),
      child: AnimatedContainer(
        duration: duration,
        curve: MotionCurves.easeOut,
        decoration: BoxDecoration(
          color: value ? AppColors.surface : AppColors.background,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: value ? AppColors.accent.withOpacity(0.7) : AppColors.stroke),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(value ? 0.32 : 0.18),
              blurRadius: value ? 22 : 12,
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
            Checkbox(
              value: value,
              onChanged: (_) => onChanged(!value),
            ),
          ],
        ),
      ),
    );
  }
}
