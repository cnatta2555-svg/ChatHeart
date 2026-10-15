package com.rovhighlight.app

import com.rovhighlight.app.detect.FightDetector
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class FightDetectorTest {
    private val tick = 500_000L

    private fun run(d: FightDetector, fromUs: Long, seconds: Int, motion: Double, db: Double?): List<FightDetector.Result> =
        (0 until seconds * 2).map { d.update(fromUs + it * tick, motion, db) }

    @Test fun calmGameDoesNothing() {
        val d = FightDetector(3)
        val r = run(d, 0, 60, 10.0, -30.0)
        assertTrue(r.all { it == FightDetector.Result.None })
    }

    @Test fun loudBusyFightTriggersOnceThenExtends() {
        val d = FightDetector(3)
        run(d, 0, 20, 10.0, -30.0)
        val fight = run(d, 20_000_000, 6, 30.0, -18.0)
        val triggers = fight.filterIsInstance<FightDetector.Result.Trigger>()
        assertEquals(1, triggers.size)
        assertEquals(20_000_000L, triggers[0].eventUs)
        assertTrue(fight.contains(FightDetector.Result.Extend))
    }

    @Test fun cooldownAfterFight() {
        val d = FightDetector(3)
        run(d, 0, 20, 10.0, -30.0)
        run(d, 20_000_000, 5, 30.0, -18.0)
        run(d, 25_000_000, 3, 10.0, -30.0)
        val again = run(d, 28_000_000, 5, 30.0, -18.0)
        assertTrue(again.none { it is FightDetector.Result.Trigger })
    }

    @Test fun motionOnlyWithoutAudio() {
        val d = FightDetector(3)
        run(d, 0, 20, 10.0, null)
        val r = run(d, 20_000_000, 5, 25.0, null)
        assertEquals(1, r.count { it is FightDetector.Result.Trigger })
    }

    @Test fun noTriggerDuringWarmup() {
        val d = FightDetector(5)
        val r = run(d, 0, 6, 50.0, -10.0)
        assertTrue(r.none { it is FightDetector.Result.Trigger })
    }
}
