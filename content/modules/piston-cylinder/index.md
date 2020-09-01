+++
title = "Piston Cylinder"
date = 2020-08-21T12:10:34-04:00
draft = false
thumbnail = "piston-cylinder.png"
description = """
The piston-cylinder apparatus is a standard tool used to illustrate thermodynamic concepts involving heat, work, and internal energy. This module simulates a collection of atoms in a chamber with a movable wall under external pressure."""
+++

# Introduction

This module presents an interactive molecular simulation of a piston-cylinder apparatus. The piston-cylinder apparatus is a standard tool used to conceptualize and illustrate thermodynamic concepts involving heat, work, and internal energy. The module may be used also to study equations of state, reversibility, and corresponding states concepts. These ideas form the core of thermodynamics, and this module illustrates how they arise from the aggregate motions of many molecules, each behaving according to simple classical mechanics.

The simulated apparatus is a container (cylinder) with one movable wall (the piston), within which are spherical molecules (number adjustable) undergoing simple molecular dynamics. The piston moves in response to collisions with the molecules. The external pressure on the piston may be adjusted, and the system may be set as isothermal or adiabatic. The instantaneous and average density and pressure adopted by the system are presented. A dynamic plot is available showing graphically the response of the system to changes in state. Many different quantitative and qualitative experiments can be performed to explore the thermodynamic behavior of the system. The observed behavior is clearly seen as a consequence of the collective molecular motions.

This module is applicable to thermodynamics courses at both the undergraduate and graduate levels.

# Background

## First Law of Thermodynamics

### Internal Energy

The first law of thermodynamics is an energy balance. It states that net sum of the energy transferred into or out of a system equals the change in its energy. This law is important to predicting the behavior of a complex system as it undergoes various changes, such as heating, expansion, boiling, and so on. This first law permits us to predict, for example, by how much the temperature and pressure will change as chemicals react, or as another example, how much power we can expect to get from a generator as it burns a fuel.

Mechanical systems, such as a pendulum or a mass on a spring, hold their energy in kinetic and potential forms. Kinetic energy is the energy of motion, while a familiar example of potential energy is that acquired by an object as it is raised to a higher level in a gravitational field. Systems described by thermodynamics can store energy in these ways also, but this aspect is not of particular interest in this context. Instead, thermodynamics focuses on how systems store energy in the motion and interaction of the molecules it comprises, i.e., in the molecules' kinetic and potential energies. At the macroscopic level, the molecular behaviors occur on a scale too small to be seen, so all this energy is lumped into a single term, called "internal energy". In molecular simulations, molecules can of course be seen, so the changes occurring as a system gains or loses internal energy are apparent in the changes in the motion of the molecules. It can be observed that the molecules move faster when the internal energy is increased. Molecules also may store potential energy as a consequence of their interactions with each other. Real molecules tend to want to stick together loosely, and some energy is required to separate them, just as mechanical systems require energy to be elevated in a gravitational field. The manner that these energy-storage methods enter into the energy balance is a concern of thermodynamics.

A thermodynamic system exchanges energy with its surroundings in the form of heat and/or work. The first law states that any energy lost or gained via these mechanisms adds to or diminishes the internal energy of the system. In thermodynamics, the internal energy is nothing more than a bookkeeping term in the energy balance. But in our simulations we have a window on the microscopic world, and we can see how the internal-energy changes manifest themselves in the molecular behaviors.

In this simulation module, we consider our system to be all the molecules contained within the piston-cylinder apparatus. The piston-cylinder apparatus itself forms the surroundings, and it may store energy in any of three ways. First, the piston can move with some velocity, and thus it may acquire kinetic energy. Second, the piston has a pressure acting on it, which may be viewed as the effect of a weight applied atop it, and as it moves up and down the potential energy of the mass increases and decreases. Third, the cylinder can act as a heat reservoir, and thus can accept or release energy from/to the molecules in the form of heat, without itself being affected by the transfer. It is as if the cylinder were located within a large container of water that is fixed at some temperature.

### Work

Work occurs when a force acts to move an object across a distance. The relevant equation is

{{< katex display >}}
W=F\times \Delta x
{{< /katex >}}

Work is performed on (or by) the piston-cylinder apparatus when the piston is moved against (or by) the force of the fluid of molecules inside the cylinder. The force is equal to the resisting pressure times the area of the piston

{{< katex display >}}
F=P\times A
{{< /katex >}}

while the displacement can be given in terms of the volume change via the piston area

{{< katex display >}}
{\displaystyle \Delta x={\frac {\Delta V}{A}}}
{{< /katex >}}

Consequently, the work can be expressed in terms of the pressure and the volume change

{{< katex display >}}
{\displaystyle W=P\times \Delta V}
{{< /katex >}}

All of these equations assume that the force (or pressure) does not change during the process. Otherwise, a differential form is appropriate.

### Heat

Energy can also be transferred into a system via molecular-level interactions with the surroundings. Molecules in the system bounce into the molecules of the container, and energy is transferred. Like the internal energy, these phenomena occur on a scale too small to be seen macroscopically, so in thermodynamics the sum of these myriad interactions are lumped together and called "heat." This is the only difference between heat and work: work is energy transferred through some macroscopic phenomenon, such as the motion of a piston; heat is energy transferred through microscopic processes.

In the piston-cylinder module, the details of heat transfer are not included in the molecular simulation. Instead the walls of the cylinder are described as smooth planar surfaces, with no atomic detail. The heat transfer process is modeled by changing the velocities of molecules at each step in the simulation. The velocities are chosen to be consistent with the selected wall temperature: if the temperature is high, the velocities will be large; if the temperature is low, the velocities will be small. Any change in the velocity of a molecule changes its kinetic energy, and is thus a form of microscopic energy transfer, i.e. heat. We have no meter in place to quantify directly this heat transfer process. Instead, the amount of heat transferred must be deduced from measurements of work performed and change of temperature of the system, from which the change in internal energy can be inferred.


## Reversible Processes

It must be emphasized the the force (or pressure) given in the work formula is the force of the molecules (the system) on the piston. In the piston-cylinder apparatus there are two relevant pressures, or forces, acting on the piston: (1) the "external" pressure applied to the piston, and which in the applet can be adjusted to any value with the slider; and (2) the "internal" pressure exerted by the molecules on the piston as they continually bounce off of it. At equilibrium, these two pressures are equal and the piston undergoes no net motion. When this balance is altered by changing the external pressure via the slider, decreasing it for example, the piston accelerates and the system volume increases. In a reversible process, the imbalance of forces is small. Consequently the acceleration of the piston is small also and it acquires little momentum. In the reversible process, all the work performed by the system in pushing up the piston goes into the potential energy of the piston mass and the process operates as efficiently as it can. In contrast, in an irreversible expansion there is significant imbalance of the external and internal forces, and the piston acquires some kinetic energy. As the piston rises and ultimately falls back down again, this energy is returned to the molecules, tending to raise the system temperature. In response, heat flows out of the system, and this lost energy represents an inefficiency in the process.

Note that the irreversibility arises without introducing friction into the process. In the applet, piston friction is not included in the model, so no energy is lost there. Any losses are entirely a consequence of the imbalance of the system with its surroundings.

## Model

### Basic dynamic behavior

The physical model underlying the piston-cylinder apparatus is very simple, and follows the most elementary laws of mechanics. The interesting feature of the simulation is the way that it shows how the more abstract thermodynamic behavior arises from the "statistical mechanics" of the collective molecular motions.

The cylinder contains spherical molecules that bounce off one another and the walls of the apparatus. There are three types of collisions that arise

1. Molecule-molecule collisions. Collisions between molecules are completely elastic, and they proceed in a way that always conserves the total energy and momentum of the colliding pair.
2. Molecule-cylinder collisions. The cylinder walls are immobile, and collisions of the spheres with them reverses the molecules trajectory in the direction perpendicular to the wall. It is just like a billiard ball bouncing off a wall. Energy is conserved, but momentum is not.
3. Molecule-piston collisions. The piston is a movable wall that that can acquire and give up momentum in its collisions with the molecules. Molecule-piston collisions conserve energy and momentum.

The piston moves under the influence of a constant downward force, so it tends to accelerate downward in the absence of any collisions with the molecules. The continual collision of the molecules with the piston tends to reverse motion, pushing it back up. The piston position fluctuates up and down as the molecules patter it with collisions. The magnitude of the imposed force varies directly with the selected value of the external pressure. If the force (pressure) is greater, the piston accelerates more, and consequently a larger number of collisions is required to slow it down. The number of collisions increases only as the volume decreases, so in increasing the pressure, the piston position moves downward until the rate of collisions with it is the right amount to offset its motion.

### Adiabatic and isothermal behavior

The model may be set so the the system of molecules behaves as an isothermal or as an adiabatic system. In the adiabatic case, there is no energy transferred as heat between the molecules to the surroundings. The molecules move and collide according to the basic laws of mechanics, as described above. For isothermal behavior, the molecules gain and lose energy via heat transfer to the surroundings. In a real system this happens when the molecules collide with the walls, causing the molecules forming the walls to speed up or slow down. We don't employ such a detailed model here. Instead, we mimic heat transfer by artifically speeding up or slowing down all the molecules at once, intermittently during the simulation, in such a way that they keep an average velocity consistent with the imposed temperature.

### Molecular models

Three models are available to describe the way that the molecules interact with each other. With the ideal-gas model, the molecules have no interaction at all. They do not collide, but instead can pass right through each other. They do of course undergo collisions with the piston and the cylinder, as described above. However, since the molecules do not collide with each other, they have no way to equilibrate, or to transfer momentum between their x- and y-directed motions. The absence of such coupling of their motion can give rise to anomalous behavior, and cause misleading results. To offset this problem, we artifically couple motion in the x and y directions through the wall collisions. When a molecule collides with a cylinder wall, it doesn't undergo completely realistic dynamics. Instead the total kinetic energy is distributed in a random fashion between the x- and y-directions of motion. If the molecule were to go upwards after the collision, it will still go upwards, but it may be with an upward speed that would be given by a simple collision. This feature is not as unrealistic as it might at first sound. One can regard this random element as a way to model the randomness arising in the molecule's collision with the atoms of the cylinder walls. Although motivated by the need to obtain correct ideal-gas behavior, this modeling feature is in effect for all the molecular models.

The second model is one that introduces purely repuslive interactions between the molecules: the molecules only repel each other, and they have nothing that makes them want to stick together. The molecules bounce off each other just as though they were little marbles, or billiard balls.

The third model keeps the repulsion part and adds molecular attractions. The molecules want to stick together, and will do so if the thermal energy (i.e., the temperature) is sufficiently small. These molecules are capable of condensing, and forming something resembling a liquid phase (there are too few of them in the system to get realistic liquid behavior).