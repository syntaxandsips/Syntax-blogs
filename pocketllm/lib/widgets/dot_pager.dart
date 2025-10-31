import 'dart:math';

import 'package:flutter/material.dart';

import '../motion/effects.dart';
import '../theme/colors.dart';

class DotPager extends StatelessWidget {
  const DotPager({
    super.key,
    required this.count,
    required this.page,
    this.reduceMotion = false,
  });

  final int count;
  final double page;
  final bool reduceMotion;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(count, (index) {
        final distance = (page - index).abs();
        final intensity = (1 - min(distance, 1.0)).clamp(0.0, 1.0);
        final size = 10.0 + 4.0 * intensity;
        final color = Color.lerp(AppColors.stroke, AppColors.primary, intensity) ?? AppColors.stroke;

        Widget dot = AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOut,
          width: size,
          height: 10,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(999),
          ),
        );

        if (!reduceMotion) {
          dot = animatePagerDot(dot, intensity, reduceMotion: reduceMotion);
        }
        return dot;
      }),
    );
  }
}
