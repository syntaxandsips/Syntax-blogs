import 'package:flutter/material.dart';

class OnboardingIllustration extends StatefulWidget {
  const OnboardingIllustration({
    super.key,
    required this.asset,
    this.height,
    this.alignment = Alignment.center,
    this.reduceMotion = false,
  });

  final String asset;
  final double? height;
  final Alignment alignment;
  final bool reduceMotion;

  @override
  State<OnboardingIllustration> createState() => _OnboardingIllustrationState();
}

class _OnboardingIllustrationState extends State<OnboardingIllustration> {
  ImageInfo? _staticFrame;
  ImageStream? _stream;
  ImageStreamListener? _listener;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _resolveImage();
  }

  @override
  void didUpdateWidget(covariant OnboardingIllustration oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.asset != widget.asset || oldWidget.reduceMotion != widget.reduceMotion) {
      _staticFrame = null;
      _resolveImage();
    }
  }

  void _resolveImage() {
    if (_listener != null && _stream != null) {
      _stream!.removeListener(_listener!);
    }
    if (!widget.reduceMotion) {
      return;
    }
    final provider = AssetImage(widget.asset);
    final stream = provider.resolve(createLocalImageConfiguration(context));
    _stream = stream;
    _listener = ImageStreamListener((image, _) {
      if (_staticFrame == null && mounted) {
        setState(() {
          _staticFrame = image;
        });
      }
    });
    stream.addListener(_listener!);
  }

  @override
  void dispose() {
    if (_listener != null && _stream != null) {
      _stream!.removeListener(_listener!);
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.reduceMotion && _staticFrame != null) {
      return Align(
        alignment: widget.alignment,
        child: RawImage(
          image: _staticFrame!.image,
          fit: BoxFit.contain,
          height: widget.height,
        ),
      );
    }

    return Align(
      alignment: widget.alignment,
      child: Image.asset(
        widget.asset,
        height: widget.height,
        fit: BoxFit.contain,
      ),
    );
  }
}
