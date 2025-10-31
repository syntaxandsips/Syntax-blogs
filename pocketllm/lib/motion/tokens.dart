import 'package:flutter/animation.dart';

class MotionDurations {
  MotionDurations._();

  static const Duration short = Duration(milliseconds: 180);
  static const Duration medium = Duration(milliseconds: 260);
  static const Duration long = Duration(milliseconds: 380);
  static const Duration pager = Duration(milliseconds: 420);
  static const Duration debounce = Duration(milliseconds: 300);
}

class MotionCurves {
  MotionCurves._();

  static const Curve easeOut = Curves.easeOutCubic;
  static const Curve spring = Curves.easeOutBack;
}
