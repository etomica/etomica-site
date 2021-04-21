

The dynamics of molecules has them colliding and recolliding with each other, and observation of the trajectory of any given molecule will find that it meanders erratically and randomly through the available volume.  Although there is no directed motion, a molecule will not remain indefinitely in the vicinity of its present position.  The question arises, &quot;how far will a molecule travel in a given time interval?&quot;  This matter is relevant to transport processes in the material, most notably (but not only) the rate of diffusion.

The *mean square displacement* (*msd*) is a measure of the average distance a molecule travels. &nbsp;It is defined



$$
msd(t) = \left \langle \Delta r_i(t)^2\right \rangle = \left \langle (r_i(t) -r_i(0))^2 \right \rangle
$$



In this equation, **r**<sub>i</sub>(t)-**r**<sub>i</sub>(0) is the (vector) distance traveled by molecule *i* over some time interval of length *t*, and the squared magnitude of this vector is averaged&nbsp;(as indicated by the angle brackets) over many such time intervals.  Often this quantity is averaged also over all molecules in the system, summing *i* from 1 to *N* and dividing by *N*.

If the molecule encountered no other molecules, traveling ballistically, then the distance it traveled would be proportional to the time interval---distance equals velocity times time---and the *msd* would increase *quadratically* with *t*.  In denser phases, quadratic behavior holds only for a very short time interval, of the order of the mean collision time.  Beyond this time the motion is better described as a random walk, for which the *msd* increases only *linearly* with time.  The rate of growth of the mean square displacement depends on how often the molecule suffers collisions.  At higher density, it will take longer to diffuse a given distance, as other molecules continually impede its progress.

The limiting slope of *msd*(*t*), considered for time intervals sufficiently long for it to be in the linear regime, is related to the self-diffusion constant *D*.



$$
\lim_{t \to \omega}\frac{d}{dt}\left \langle \Delta r_i(t)^2 \right \rangle = 2dD
$$



where *d* is the dimension of the space.