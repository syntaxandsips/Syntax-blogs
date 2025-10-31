import 'package:flutter/material.dart';

import '../theme/colors.dart';

class SafeScaffold extends StatelessWidget {
  const SafeScaffold({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          color: AppColors.background,
          child: child,
        ),
      ),
    );
  }
}
