import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTypography {
  AppTypography._();

  static TextTheme createTextTheme() {
    final base = ThemeData(brightness: Brightness.dark).textTheme;
    return TextTheme(
      displayLarge: GoogleFonts.sora(
        textStyle: base.displayLarge?.copyWith(fontSize: 32, height: 36 / 32),
      ),
      displayMedium: GoogleFonts.sora(
        textStyle: base.displayMedium?.copyWith(fontSize: 28, height: 32 / 28),
      ),
      headlineMedium: GoogleFonts.sora(
        textStyle: base.headlineMedium?.copyWith(fontSize: 22, height: 28 / 22),
      ),
      titleLarge: GoogleFonts.sora(
        textStyle: base.titleLarge?.copyWith(fontSize: 20, height: 26 / 20),
      ),
      bodyLarge: GoogleFonts.inter(
        textStyle: base.bodyLarge?.copyWith(fontSize: 16, height: 24 / 16),
      ),
      bodyMedium: GoogleFonts.inter(
        textStyle: base.bodyMedium?.copyWith(fontSize: 15, height: 22 / 15),
      ),
      bodySmall: GoogleFonts.inter(
        textStyle: base.bodySmall?.copyWith(fontSize: 13, height: 20 / 13),
      ),
      labelLarge: GoogleFonts.inter(
        textStyle: base.labelLarge?.copyWith(fontSize: 14, height: 20 / 14, fontWeight: FontWeight.w600),
      ),
    );
  }
}
