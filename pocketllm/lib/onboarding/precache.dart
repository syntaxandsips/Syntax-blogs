import 'package:flutter/material.dart';

const illustrations = [
  'assets/illustration/ob1.png',
  'assets/illustration/ob2.png',
  'assets/illustration/ob3.gif',
  'assets/illustration/ob4.gif',
  'assets/illustration/ob5.gif',
  'assets/illustration/ob6.gif',
];

Future<void> precacheIllustrations(BuildContext context) async {
  for (final asset in illustrations) {
    final provider = AssetImage(asset);
    await precacheImage(provider, context);
  }
}
