import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../motion/tokens.dart';
import '../theme/spacing.dart';
import '../widgets/dot_pager.dart';
import '../widgets/safe_scaffold.dart';
import 'onboarding_state.dart';
import 'screen1_welcome.dart';
import 'screen2_providers.dart';
import 'screen3_routing_tools.dart';
import 'screen4_privacy.dart';
import 'screen5_permissions.dart';
import 'screen6_done.dart';

class OnboardingPager extends HookConsumerWidget {
  const OnboardingPager({
    super.key,
    required this.onFinished,
  });

  final VoidCallback onFinished;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reduceMotion = MediaQuery.of(context).accessibilityFeatures.reduceMotion;
    final controller = usePageController();
    final page = useState(0.0);
    final notifier = ref.read(onboardingStateProvider.notifier);

    useEffect(() {
      void listener() {
        page.value = controller.page ?? controller.initialPage.toDouble();
      }

      controller.addListener(listener);
      return () => controller.removeListener(listener);
    }, [controller]);

    Future<void> goTo(int index) async {
      final clamped = index.clamp(0, 5);
      if (reduceMotion) {
        controller.jumpToPage(clamped);
      } else {
        await controller.animateToPage(
          clamped,
          duration: MotionDurations.pager,
          curve: Curves.easeOutCubic,
        );
      }
    }

    Widget buildPage(int index) {
      switch (index) {
        case 0:
          return Screen1Welcome(
            onContinue: () => goTo(1),
            onSkip: () {
              notifier.markCompleted();
              onFinished();
            },
            pageOffset: page.value - 0,
            reduceMotion: reduceMotion,
          );
        case 1:
          return Screen2Providers(
            reduceMotion: reduceMotion,
            onLater: () => goTo(2),
          );
        case 2:
          return Screen3RoutingTools(
            reduceMotion: reduceMotion,
            onContinue: () => goTo(3),
          );
        case 3:
          return Screen4Privacy(
            reduceMotion: reduceMotion,
            onContinue: () => goTo(4),
          );
        case 4:
          return Screen5Permissions(
            reduceMotion: reduceMotion,
            onEnable: () async {
              await Future<void>.delayed(const Duration(milliseconds: 1800));
              await goTo(5);
            },
            onSkip: () => goTo(5),
          );
        case 5:
        default:
          return Screen6Done(
            reduceMotion: reduceMotion,
            onStart: () {
              notifier.markCompleted();
              onFinished();
            },
            onImport: () {
              notifier.markCompleted();
              onFinished();
            },
          );
      }
    }

    return SafeScaffold(
      child: Column(
        children: [
          Expanded(
            child: NotificationListener<OverscrollIndicatorNotification>(
              onNotification: (notification) {
                notification.disallowIndicator();
                return true;
              },
              child: PageView.builder(
                controller: controller,
                itemCount: 6,
                physics: const ClampingScrollPhysics(),
                itemBuilder: (context, index) => buildPage(index),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
            child: DotPager(
              count: 6,
              page: page.value,
              reduceMotion: reduceMotion,
            ),
          ),
        ],
      ),
    );
  }
}
