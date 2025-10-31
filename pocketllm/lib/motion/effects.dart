import 'package:flutter/widgets.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../theme/colors.dart';
import 'tokens.dart';

Widget animateTitle(Widget child, {bool reduceMotion = false, Duration? delay}) {
  if (reduceMotion) {
    return child.animate(delay: delay ?? Duration.zero).fadeIn(duration: MotionDurations.short);
  }
  return child
      .animate(delay: delay ?? Duration.zero)
      .fadeIn(duration: MotionDurations.medium, curve: MotionCurves.easeOut)
      .slide(begin: const Offset(0, 0.12), end: Offset.zero, duration: MotionDurations.medium, curve: MotionCurves.easeOut);
}

Widget animateSubtitle(Widget child, {bool reduceMotion = false, Duration? delay}) {
  final effectiveDelay = delay ?? const Duration(milliseconds: 100);
  if (reduceMotion) {
    return child.animate(delay: effectiveDelay).fadeIn(duration: MotionDurations.short);
  }
  return child
      .animate(delay: effectiveDelay)
      .fadeIn(duration: MotionDurations.medium, curve: MotionCurves.easeOut)
      .slide(begin: const Offset(0, 0.12), end: Offset.zero, duration: MotionDurations.medium, curve: MotionCurves.easeOut);
}

Widget animateIllustration(Widget child, {bool reduceMotion = false, Duration? delay}) {
  if (reduceMotion) {
    return child.animate(delay: delay ?? Duration.zero).fadeIn(duration: MotionDurations.short);
  }
  return child
      .animate(delay: delay ?? Duration.zero)
      .fadeIn(duration: MotionDurations.long, curve: Curves.easeOut)
      .scale(begin: 0.96, end: 1, duration: MotionDurations.long, curve: MotionCurves.easeOut);
}

Widget animateCta(Widget child, {bool reduceMotion = false, Duration? delay}) {
  if (reduceMotion) {
    return child.animate(delay: delay ?? Duration.zero).fadeIn(duration: MotionDurations.short);
  }
  return child
      .animate(delay: delay ?? Duration.zero)
      .fadeIn(duration: MotionDurations.medium)
      .slide(begin: const Offset(0, 0.2), end: Offset.zero, duration: MotionDurations.medium, curve: MotionCurves.spring);
}

Widget animateChip(Widget child, {bool reduceMotion = false, Duration? delay}) {
  if (reduceMotion) {
    return child.animate(delay: delay ?? Duration.zero).fadeIn(duration: MotionDurations.short);
  }
  return child
      .animate(delay: delay ?? Duration.zero)
      .fadeIn(duration: MotionDurations.medium)
      .slide(begin: const Offset(0, 0.08), end: Offset.zero, curve: MotionCurves.easeOut)
      .scale(begin: 0.96, end: 1, duration: MotionDurations.medium, curve: MotionCurves.easeOut);
}

Widget animateToggle(Widget child, {bool reduceMotion = false, Duration? delay}) {
  if (reduceMotion) {
    return child.animate(delay: delay ?? Duration.zero).fadeIn(duration: MotionDurations.short);
  }
  return child
      .animate(delay: delay ?? Duration.zero)
      .fadeIn(duration: MotionDurations.medium)
      .slide(begin: const Offset(0, 0.1), end: Offset.zero, curve: MotionCurves.easeOut);
}

Widget animateCheckbox(Widget child, {bool reduceMotion = false, Duration? delay}) {
  if (reduceMotion) {
    return child.animate(delay: delay ?? Duration.zero).fadeIn(duration: MotionDurations.short);
  }
  return child
      .animate(delay: delay ?? Duration.zero)
      .fadeIn(duration: MotionDurations.medium)
      .slide(begin: const Offset(0, 0.1), end: Offset.zero, curve: MotionCurves.easeOut);
}

Widget animatePagerDot(Widget child, double intensity, {bool reduceMotion = false}) {
  if (reduceMotion) {
    return child;
  }
  final scale = 1 + 0.6 * intensity;
  final color = Color.lerp(AppColors.stroke, AppColors.primary, intensity) ?? AppColors.stroke;
  return child
      .animate(target: intensity)
      .scale(begin: 1, end: scale, duration: MotionDurations.short)
      .tint(color: color, duration: MotionDurations.short);
}
