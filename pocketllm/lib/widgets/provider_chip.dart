import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../motion/tokens.dart';
import '../theme/colors.dart';

class ProviderChip extends StatelessWidget {
  const ProviderChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
    this.highlight = false,
    this.reduceMotion = false,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;
  final bool highlight;
  final bool reduceMotion;

  @override
  Widget build(BuildContext context) {
    final bgColor = selected ? AppColors.surface : Colors.transparent;
    final borderColor = selected ? AppColors.primary : AppColors.stroke;

    Widget chip = AnimatedContainer(
      duration: MotionDurations.medium,
      curve: MotionCurves.easeOut,
      decoration: BoxDecoration(
        color: bgColor.withOpacity(selected ? 0.8 : 0.4),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: borderColor, width: 1.4),
        boxShadow: highlight
            ? [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.35),
                  blurRadius: 16,
                  spreadRadius: 1,
                ),
              ]
            : [
                BoxShadow(
                  color: Colors.black.withOpacity(0.25),
                  blurRadius: 10,
                  spreadRadius: 0,
                  offset: const Offset(0, 4),
                ),
              ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedOpacity(
            duration: MotionDurations.medium,
            opacity: selected ? 1 : 0,
            child: Icon(Icons.check, size: 18, color: AppColors.textPrimary),
          ),
          if (selected) const SizedBox(width: 8),
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );

    if (!reduceMotion) {
      chip = chip
          .animate(target: selected ? 1 : 0)
          .scale(begin: const Offset(0.98, 0.98), end: const Offset(1, 1), duration: MotionDurations.short);

      if (highlight) {
        chip = chip.animate(onPlay: (controller) => controller.repeat(reverse: true)).scale(
              begin: const Offset(1, 1),
              end: const Offset(1.04, 1.04),
              duration: const Duration(milliseconds: 700),
              curve: Curves.easeInOut,
            );
      }
    }

    return Semantics(
      button: true,
      selected: selected,
      label: label,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(999),
          onTap: onTap,
          child: chip,
        ),
      ),
    );
  }
}
