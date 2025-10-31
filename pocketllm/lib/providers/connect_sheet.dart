import 'package:flutter/material.dart';

import '../motion/tokens.dart';
import '../theme/colors.dart';

Future<String?> showConnectSheet(
  BuildContext context, {
  required String provider,
  bool reduceMotion = false,
  String? existingKey,
}) {
  return showModalBottomSheet<String>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => _ConnectSheet(
      provider: provider,
      reduceMotion: reduceMotion,
      existingKey: existingKey,
    ),
  );
}

class _ConnectSheet extends StatefulWidget {
  const _ConnectSheet({
    required this.provider,
    required this.reduceMotion,
    this.existingKey,
  });

  final String provider;
  final bool reduceMotion;
  final String? existingKey;

  @override
  State<_ConnectSheet> createState() => _ConnectSheetState();
}

class _ConnectSheetState extends State<_ConnectSheet> {
  late final TextEditingController _controller = TextEditingController(text: widget.existingKey ?? '');

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final safePadding = media.viewInsets.bottom;

    Widget content = Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: const [
          BoxShadow(color: Colors.black54, blurRadius: 24, offset: Offset(0, -6)),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Connect ${widget.provider}',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 12),
          Text(
            'Enter your ${widget.provider} API key. Stored locally only.',
            style:
                Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _controller,
            obscureText: true,
            decoration: InputDecoration(
              hintText: 'sk-xxxx',
              filled: true,
              fillColor: AppColors.background,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: const BorderSide(color: AppColors.stroke),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: const BorderSide(color: AppColors.primary),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(_controller.text.trim()),
                  child: const Text('Save'),
                ),
              ),
            ],
          ),
        ],
      ),
    );

    if (!widget.reduceMotion) {
      content = TweenAnimationBuilder<double>(
        tween: Tween(begin: 0.9, end: 1),
        duration: MotionDurations.medium,
        curve: Curves.easeOutBack,
        builder: (context, value, child) {
          return Transform.scale(scale: value, child: child);
        },
        child: content,
      );
    }

    return Padding(
      padding: EdgeInsets.only(bottom: safePadding),
      child: content,
    );
  }
}
